using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

using ElectronCgi.DotNet;

namespace App.Local {
    class ElectronCGI {

        private List<Task> _tasks;

        private Connection _connection = null;

        public ElectronCGI() {
            _tasks = new List<Task>();
            _connection = new ConnectionBuilder()
                                .WithLogging(Constants.ELECTRON_LOG_FILE, minimumLogLevel: LogLevel.Trace)
                                .Build();
        }

        private Task SelectPrograms(String term) {
            var query = String.Format(
                            @"  
                                SELECT TOP 2
                                System.Search.Rank, System.ItemNameDisplayWithoutExtension,
                                System.Kind, System.DateModified, System.DateAccessed, System.RatingText, System.Keywords,
                                System.Size, System.ContentType, System.ItemType, System.ItemPathDisplay,
                                System.FileExtension, System.ItemTypeText, System.ApplicationName, System.ThumbnailCacheId
                                FROM SystemIndex
                                WHERE SCOPE='file:{0}' AND CONTAINS(System.FileName, '{1}', 1033) AND CONTAINS(System.KindText, '{2}', 1033)
                                ORDER BY System.DateAccessed DESC, System.Search.Rank DESC
                            ",
                            Constants.ROOT_SEARCH_DIR, "\"*"+term+"*\"", "\"*program*\""
                        );

            _connection.Send("show-programs", Database.ExecuteQuery(query));
            return Task.CompletedTask;
        }

        private Task SelectFolders(String term) {
            var query = String.Format(
                            @"  
                                SELECT TOP 3
                                System.Search.Rank, System.ItemNameDisplayWithoutExtension,
                                System.Kind, System.DateModified, System.DateAccessed, System.RatingText, System.Keywords,
                                System.Size, System.ContentType, System.ItemType, System.ItemPathDisplay,
                                System.FileExtension, System.ItemTypeText, System.ApplicationName, System.ThumbnailCacheId
                                FROM SystemIndex
                                WHERE SCOPE='file:{0}' AND CONTAINS(System.FileName, '{1}', 1033) AND CONTAINS(System.KindText, '{2}', 1033)
                                ORDER BY System.DateAccessed DESC, System.Search.Rank DESC
                            ",
                            Constants.ROOT_SEARCH_DIR, "\"*"+term+"*\"", "\"*folder*\""
                        );

            _connection.Send("show-folders", Database.ExecuteQuery(query));
            return Task.CompletedTask;
        }

        public void BuildRecievingRequests() {
            if (_connection == null) return;

            _connection.On("select-programs", async (String query) => {
                await SelectPrograms(query);
            });

            _connection.On("select-folders", async (String query) => {
                await SelectFolders(query);
            });

            _connection.Listen();
        }
    }
}