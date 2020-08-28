// using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Hosting;

using App.Local;
using App.Local.Services;

namespace App {
    class Program {
        static void Main(String[] args) {
            CreateHostBuilder(args).Build().Run();
            
            List<Task> tasks = new List<Task>();
            
            Task database = Task.Run(() => {
                Database.OpenConnection();
                // Database.CreateDirectories();
            });

            Task nodeJS = database.ContinueWith((res) => {
                new NodeJS().BuildRecievingRequests();
            });

            tasks.Add(nodeJS);
            Task.WaitAll(tasks.ToArray());
        }

       public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) => {
                services.AddHostedService<Watcher>();
            }).UseWindowsService();
    }
}
