// using ElectronCgi.DotNet;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

using App.Local;

namespace App
{
    class Program
    {
        static List<Task> _tasks = new List<Task>();

        static void Main(String[] args)
        {
            _tasks.Add(
                Task.Run(() =>
                {
                    // Establish database
                    Database.OpenConnection();
                }).ContinueWith((res) =>
                {
                    // Setup electron and c# connection if database
                    if (Database.IsConnectionActive())
                        new ElectronCGI().BuildRecievingRequests();
                    else
                        Console.Error.WriteLine("No database connected.");
                }).ContinueWith((res) =>
                {
                    // Close if database connection
                    if (Database.IsConnectionActive())
                        Database.CloseConnection();
                })
            );

            Task.WaitAll(_tasks.ToArray());
        }
    }
}
