using ElectronCgi.DotNet;
using System;
using Microsoft.Extensions.Logging;

namespace App.Local {
    class NodeJS {

        private Connection _connection = null;

        public NodeJS() {
            _connection = new ConnectionBuilder()
                                .WithLogging(Constants.ELECTRON_LOG_FILE, minimumLogLevel: LogLevel.Trace)
                                .Build();
        }

        Func<String, String> selectDirectories = (String term) => {
            String query = $"SELECT * FROM Directories WHERE name like '%{term}%' ORDER BY last_access_time DESC LIMIT 3";
            return Database.ExecuteQuery(query);
        };

        public void BuildRecievingRequests() {
            if (_connection == null) return;
            Console.Error.WriteLine("NodeJS Started....");
            _connection.On("select-directories", selectDirectories);
            _connection.Listen();
        }
    }
}