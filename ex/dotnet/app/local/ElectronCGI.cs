using ElectronCgi.DotNet;
using System;
using System.Collections.Generic;

using Microsoft.Extensions.Logging;

namespace App.Local {
    class ElectronCGI {

        private Connection _connection = null;

        public ElectronCGI() {
            _connection = new ConnectionBuilder()
                                .WithLogging(Constants.ELECTRON_LOG_FILE, minimumLogLevel: LogLevel.Trace)
                                .Build();
        }

        Func<String, String> selectDirectories = (String term) => {
            var query = String.Format(
                            @"  
                                SELECT TOP 10
                                System.Search.Rank, System.ItemName, System.DateModified,
                                System.Size, System.ContentType, System.ItemType, System.ItemPathDisplay,
                                System.FileExtension, System.ItemTypeText, System.MIMEType, System.ApplicationName
                                FROM SystemIndex
                                WHERE SCOPE='file:{0}' AND CONTAINS(System.FileName, '{1}', 1033) ORDER BY System.Search.Rank DESC
                            ",
                            Constants.ROOT_SEARCH_DIR, "\"*"+term+"*\""
                        );
            return Database.ExecuteQuery(query);
        };

        public void BuildRecievingRequests() {
            if (_connection == null) return;
            _connection.On("select-directories", selectDirectories);
            _connection.Listen();
        }
    }
}