using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Permissions;
using Microsoft.Extensions.Logging;

// @Ref: https://docs.microsoft.com/en-us/dotnet/api/system.io.filesystemwatcher?redirectedfrom=MSDN&view=netcore-3.1#Mtps_DropDownFilterText
namespace App.Local.Services
{
    public class WatchFileSystem : BackgroundService
    {
        private readonly ILogger<WatchFileSystem> _logger;

        private readonly String WATCH_DIR = @"C:\Users\Ahsan\Desktop\watching";

        private FileSystemWatcher _watcher = new FileSystemWatcher();

        private static List<String> _changes;


        public WatchFileSystem(ILogger<WatchFileSystem> logger) : base(logger)
        {
            _logger = logger;
            _changes = new List<String>();
        }

        protected override async Task ExecuteAsync(CancellationToken stopToken)
        {
            _logger.LogInformation("FileWatcher Starting...");

            await Task.Run(async () =>
            {
                await BeginWatching();
                while (!stopToken.IsCancellationRequested)
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stopToken);
                    await WriteChangesToFile();
                }
            }, stopToken).ContinueWith((res) =>
            {
                StopWatching();
            });

            _logger.LogInformation("FileWatcher Stopped!");
        }

        private void StopWatching()
        {
            // Stop Watching.
            _watcher.EnableRaisingEvents = false;
            _logger.LogInformation("FileWatcher Stopping...");

            _watcher.Changed -= OnChanged;
            _watcher.Created -= OnChanged;
            _watcher.Deleted -= OnChanged;
            _watcher.Renamed -= OnRenamed;

            _watcher.Dispose();
        }

        private Task WriteChangesToFile()
        {
            if (_changes.Count == 0) return Task.CompletedTask;

            StreamWriter streamWriter = new StreamWriter(Constants.CACHE_FILE_WATCHER, true, UTF8Encoding.UTF8);

            for (int i = _changes.Count - 1; i >= 0; i--)
            {
                streamWriter.WriteLine(_changes[i]);
                _changes.RemoveAt(i);
            }

            streamWriter.Close();

            return Task.CompletedTask;
        }

        [PermissionSet(SecurityAction.Demand, Name = "FullTrust")]
        private Task BeginWatching()
        {
            _watcher.Path = WATCH_DIR;

            // Watch for changes in LastAccess and LastWrite times, and
            // the renaming of files or directories.
            _watcher.NotifyFilter = NotifyFilters.LastAccess
                                | NotifyFilters.LastWrite
                                | NotifyFilters.FileName
                                | NotifyFilters.DirectoryName;

            // Watch all files, and subdir.
            _watcher.Filter = "";
            _watcher.IncludeSubdirectories = true;

            // Add event handlers.
            _watcher.Changed += OnChanged;
            _watcher.Created += OnChanged;
            _watcher.Deleted += OnChanged;
            _watcher.Renamed += OnRenamed;

            // Begin watching.
            _watcher.EnableRaisingEvents = true;
            _logger.LogInformation("FileWatcher Listening...");

            // Times to as most machines have double the logic processers as cores
            ThreadPool.SetMaxThreads(4, 8);

            return Task.CompletedTask;
        }

        // Define the event handlers.
        private void OnChanged(object source, FileSystemEventArgs e)
        {
            // Specify what is done when a file is changed, created, or deleted.
            ThreadPool.QueueUserWorkItem((o) => ProcessFile(e));
        }

        private void OnRenamed(object source, RenamedEventArgs e)
        {
            // Specify what is done when a file is changed, created, or deleted.
            ThreadPool.QueueUserWorkItem((o) => ProcessRenamedFile(e));
        }

        //This method processes your file, you can do your sync here
        private static void ProcessFile(FileSystemEventArgs e)
        {
            _changes.Add($"{e.ChangeType} -> {e.FullPath} | {e.Name}");
        }

        private static void ProcessRenamedFile(RenamedEventArgs e)
        {
            _changes.Add($"{e.ChangeType} -> {e.OldFullPath} | {e.FullPath} | {e.OldName} | {e.Name}");
        }
    }
}