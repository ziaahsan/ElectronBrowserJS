using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;

using App.Local;

namespace App {
    class Program {
        Events events = new Events();

        static void Main(String[] args) {
           var connection = new ConnectionBuilder().WithLogging().Build();
            connection.On<String, String>("greetings", (String name) => {
                return $"Hello {name}";   
            });
            connection.Listen(); 
        }

        public void FetchEvent(String name) {
            switch(name) {
                case "RunningApps":
                    List<String> apps = events.OnRunningApplications;
                    break;
            }
        }
    }
}
