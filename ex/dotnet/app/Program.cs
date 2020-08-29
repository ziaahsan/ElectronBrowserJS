// using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using App.Local;
using App.Local.Services;

namespace App {
    class Program {

        static void Main(String[] args) {            
            List<Task> tasks = new List<Task>();
            
            // Database
            // Task database = Task.Run(() => {
            //     Database.OpenConnection();
            //     // Database.CreateDirectories();
            // });

            Task nodeJS = Task.Run(() => {
                new NodeJS().BuildRecievingRequests();
            });

            tasks.Add(nodeJS);

            // Background Services 
            // Task services = database.ContinueWith((res) => {
            //     CreateHostBuilder(args).Build().Run();
            // });
            // tasks.Add(services);


            Task.WaitAll(tasks.ToArray());
        }

    //    public static IHostBuilder CreateHostBuilder(string[] args) =>
    //         Host
    //             .CreateDefaultBuilder(args)
    //             .ConfigureServices((hostContext, services) => {
    //                 services.AddHostedService<WatchFileSystem>();
    //             });
    }
}
