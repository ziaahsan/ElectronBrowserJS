using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;

using App.Local;

namespace App.Local {
    class NodeConnection {
        static Connection connection;

        public bool IsActive {
            get {
                return (connection == null) ? false : true;
            }
        }

        public static void SetupRecievingRequest() {
            connection = new ConnectionBuilder().WithLogging().Build();
            connection.On<String, String>("NODE_REQUEST", (String name) => {
                String results = "";
                switch(name) {
                    case "RunningApps":
                        results = JsonConvert.SerializeObject(Events.OnRunningApplications);
                        break;
                }
                return results;
            });
            connection.Listen();
        }

        public void SetupSendRequest() {

        }
    }
}