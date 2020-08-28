using ElectronCgi.DotNet;
using System;
using Microsoft.Extensions.Logging;

namespace App.Local {
    class NodeJS {

        Connection connection = null;

        public NodeJS() {
            connection = new ConnectionBuilder().WithLogging(minimumLogLevel: LogLevel.Trace).Build();
        }

        Func<String, String> selectDirectories = (String term) => {
            String query = $"SELECT * FROM Directories WHERE name like '%{term}%' ORDER BY last_access_time DESC LIMIT 3";
            return Database.ExecuteQuery(query);
        };

        public void BuildRecievingRequests() {
            if (connection == null) return;
            Console.WriteLine("NodeJS Listening...");
            connection.On("select-directories", selectDirectories);
            connection.Listen();
        }
    }
}