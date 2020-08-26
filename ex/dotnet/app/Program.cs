// using ElectronCgi.DotNet;
using System;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;

using App.Local;

namespace App {
    class Program {
        static void Main(String[] args) {
            Database.OpenConnection();
            // Database.CreateDirectories();
            // Console.WriteLine(Database.ExecuteQuery("SELECT * FROM Directories LIMIT 3;"));
            NodeJS.BuildRecieveRequests();
        }
    }
}
