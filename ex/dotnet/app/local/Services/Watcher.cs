using System;
using System.IO;
using System.Security.Permissions;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Logging;

// @Ref: https://docs.microsoft.com/en-us/dotnet/api/system.io.filesystemwatcher?redirectedfrom=MSDN&view=netcore-3.1#Mtps_DropDownFilterText
namespace App.Local.Services {
    public class Watcher : BackgroundService {
        
        int maxThreads = 4;
        readonly String WATCH_DIR = @"C:\Users\Ahsan\Desktop\watching";

        protected override Task ExecuteAsync(CancellationToken stopToken) {
            Run(stopToken);
            return Task.CompletedTask;
        }

        [PermissionSet(SecurityAction.Demand, Name = "FullTrust")]
        private void Run(CancellationToken stopToken) {
            // Create a new FileSystemWatcher and set its properties.
            using (FileSystemWatcher watcher = new FileSystemWatcher()) {
                watcher.Path = WATCH_DIR;

                // Watch for changes in LastAccess and LastWrite times, and
                // the renaming of files or directories.
                watcher.NotifyFilter = NotifyFilters.LastAccess
                                    | NotifyFilters.LastWrite
                                    | NotifyFilters.FileName
                                    | NotifyFilters.DirectoryName;

                // Watch all files, and subdir.
                watcher.Filter = "";
                watcher.IncludeSubdirectories = true;

                // Add event handlers.
                watcher.Changed += OnChanged;
                watcher.Created += OnChanged;
                watcher.Deleted += OnChanged;
                watcher.Renamed += OnChanged;

                // Begin watching.
                watcher.EnableRaisingEvents = true;

                // Times to as most machines have double the logic processers as cores
                ThreadPool.SetMaxThreads(maxThreads, maxThreads * 2);

                Console.WriteLine("Listening...");
                Console.Read();
                while (!stopToken.IsCancellationRequested);
            }
        }

        // Define the event handlers.
        private void OnChanged(object source, FileSystemEventArgs e) {
            // Specify what is done when a file is changed, created, or deleted.
            ThreadPool.QueueUserWorkItem((o) => ProcessFile(e));
        }

        //This method processes your file, you can do your sync here
        private static void ProcessFile(FileSystemEventArgs e) {
            // Based on the eventtype you do your operation
            switch (e.ChangeType) {
                case WatcherChangeTypes.Changed:
                    Console.WriteLine($"File is changed: {e.FullPath} {e.ChangeType}");
                    break;
                case WatcherChangeTypes.Created:
                    Console.WriteLine($"File is created: {e.FullPath} {e.ChangeType}");
                    break;
                case WatcherChangeTypes.Deleted:
                    Console.WriteLine($"File is deleted: {e.FullPath} {e.ChangeType}");
                    break;
                case WatcherChangeTypes.Renamed:
                    Console.WriteLine($"File is renamed: {e.FullPath} {e.ChangeType}");
                    break;
            }
        }
    }
}