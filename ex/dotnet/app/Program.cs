// using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;

using App.Local;

namespace App {
    class Program {
        Events events = new Events();

        static void Main(String[] args) {
            NodeConnection.SetupRecievingRequest();
        }
    }
}
