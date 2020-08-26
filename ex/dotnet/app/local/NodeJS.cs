using ElectronCgi.DotNet;
using System;

namespace App.Local {
    class NodeJS {
        static Connection request = new ConnectionBuilder().WithLogging().Build();

        static Func<String, String> selectDirectories = (String term) => {
            String query = $"SELECT * FROM Directories WHERE name like '%{term}%' ORDER BY last_access_time DESC LIMIT 3";
            return Database.ExecuteQuery(query);
        };

         public static void BuildRecieveRequests() {
            if (request == null) return;
            
            request.On<String, String>("select-directories", selectDirectories);
            request.Listen();
        }
    }
}