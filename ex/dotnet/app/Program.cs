// using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;

using App.Local;

namespace App {
    class Program {
        static void Main(String[] args) {
            // Cache by default when connection builds
            Events.CacheInstalledApplications();
        }
    }
}
