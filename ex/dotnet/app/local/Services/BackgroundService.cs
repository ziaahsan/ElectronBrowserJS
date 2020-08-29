using System;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

// @Ref: https://docs.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/background-tasks-with-ihostedservice
namespace App.Local.Services {
    public abstract class BackgroundService : IHostedService, IDisposable {
        private readonly ILogger<BackgroundService> _logger;

        private Task _executingTask;
        private readonly CancellationTokenSource _stoppingCts = new CancellationTokenSource();

        protected abstract Task ExecuteAsync(CancellationToken stoppingToken);

        public BackgroundService(ILogger<BackgroundService> logger) {
            _logger = logger;
        }

        public virtual Task StartAsync(CancellationToken cancellationToken) {
            _logger.LogInformation("Background Service running.");

            // Store the task we're executing
            _executingTask = ExecuteAsync(_stoppingCts.Token);

            // If the task is completed then return it,
            // this will bubble cancellation and failure to the caller
            if (_executingTask.IsCompleted) {
                return _executingTask;
            }

            // Otherwise it's running
            return Task.CompletedTask;
        }

        public virtual async Task StopAsync(CancellationToken cancellationToken) {
            // Stop called without start
            if (_executingTask == null) {
                return;
            }

            try {
                // Signal cancellation to the executing method
                _stoppingCts.Cancel();
            } finally {
                // Wait until the task completes or the stop token triggers
                await Task.WhenAny(_executingTask, Task.Delay(Timeout.Infinite,
                                                            cancellationToken));
            }

        }

        public virtual void Dispose() {
            _stoppingCts.Cancel();
        }
    }
}