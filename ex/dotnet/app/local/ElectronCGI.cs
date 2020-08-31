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
                                System.Search.Rank, System.Importance, System.ItemName, System.FileName,
                                System.Kind, System.KindText,
                                System.DateModified, System.DateAccessed,
                                System.Size, System.ContentType, System.ItemType, System.ItemPathDisplay,
                                System.FileExtension, System.ItemTypeText, System.MIMEType, System.ApplicationName, System.ThumbnailCacheId
                                FROM SystemIndex
                                WHERE SCOPE='file:{0}' AND CONTAINS(System.FileName, '{1}', 1033)
                                ORDER BY System.DateAccessed DESC, System.Search.Rank DESC
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