using System;
using System.IO;
using System.Drawing;
using System.Data.SQLite;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace App.Local {
    class Database {
        static readonly String DATABASE_DIR = @".\cache\app.db";

        static SQLiteConnection connection = null;

        public static void OpenConnection() {
            connection = new SQLiteConnection ($"Data Source={DATABASE_DIR}");
            connection.Open();
        }

        public static void CloseConnection() {
            if (IsConnectionActive())
                connection.Close();
            connection = null;
        }

        public static bool IsConnectionActive() {
            if (connection != null && connection.State != 0)
                return true;
            return false;
        }

        private static Dictionary<string, object> SerializeRow(IEnumerable<string> cols, SQLiteDataReader reader) {
            var result = new Dictionary<string, object>();
            foreach (var col in cols) 
                result.Add(col, reader[col]);
            return result;
        }

        public static IEnumerable<Dictionary<string, object>> Serialize(SQLiteDataReader reader) {
            var results = new List<Dictionary<string, object>>();
            var cols = new List<string>();

            for (var i = 0; i < reader.FieldCount; i++) 
                cols.Add(reader.GetName(i));

            while (reader.Read()) 
                results.Add(SerializeRow(cols, reader));

            return results;
        }

        public static String ExecuteQuery(String query) {
            if (!IsConnectionActive()) return null;

            String results = "";
            void read() {
                using(SQLiteCommand command = new SQLiteCommand(query, connection)) {
                    SQLiteDataReader reader = command.ExecuteReader();
                    results = JsonConvert.SerializeObject(Serialize(reader), Formatting.Indented);
                }
            }
            read();
            return results;
        }

        public static void CreateDirectories() {
            if (!IsConnectionActive()) return;
            
            String query = @"
                DROP TABLE IF EXISTS Directories;
                CREATE TABLE Directories(
                    id INTEGER PRIMARY KEY,
                    name VARCHAR(275) NOT NULL,
                    type VARCHAR(15) NOT NULL,
                    path TEXT,
                    last_access_time DATE NOT NULL,
                    last_write_time DATE NOT NULL,
                    created_at DATE NOT NULL
                );
                CREATE INDEX directories_name ON Directories(name);
            ";

            SQLiteCommand createCmd = new SQLiteCommand(query, connection);
            createCmd.ExecuteNonQuery();
            
            void Fetch() {
                // Display the names of the directories.
                String rootPath = @"C:\Users\Ahsan\AppData\Roaming\Microsoft\Windows\Start Menu";
                void DirectorySearch(String outerPath) {
                    try {
                        foreach (String path in Directory.GetDirectories(outerPath)) {
                            // Ignore windows directory
                            if (path.Contains(@"C:\Windows", StringComparison.OrdinalIgnoreCase)) continue;
                            
                            query = @"
                                        INSERT INTO
                                        Directories
                                            (name, type, path, last_access_time, last_write_time, created_at)
                                        VALUES
                                            (@name, @type, @path, @last_access_time, @last_write_time, @created_at)
                                    ";
                            using(SQLiteCommand insertCmd = new SQLiteCommand(query, connection)) {
                                DirectoryInfo directoryInfo = new DirectoryInfo(path);

                                insertCmd.Parameters.AddWithValue("@name", directoryInfo.Name);
                                insertCmd.Parameters.AddWithValue("@type", "Directory");
                                insertCmd.Parameters.AddWithValue("@path", path);
                                insertCmd.Parameters.AddWithValue("@last_access_time", directoryInfo.LastAccessTime);
                                insertCmd.Parameters.AddWithValue("@last_write_time", directoryInfo.LastWriteTime);
                                insertCmd.Parameters.AddWithValue("@created_at", directoryInfo.CreationTime);
                                insertCmd.ExecuteNonQuery();
                            }

                            foreach (String file in Directory.GetFiles(path)) {
                                using(SQLiteCommand insertCmd = new SQLiteCommand(query, connection)) {
                                    FileInfo fileInfo = new FileInfo(file);

                                    insertCmd.Parameters.AddWithValue("@name", fileInfo.Name);
                                    insertCmd.Parameters.AddWithValue("@type", "File");
                                    insertCmd.Parameters.AddWithValue("@path", file);
                                    insertCmd.Parameters.AddWithValue("@last_access_time", fileInfo.LastAccessTime);
                                    insertCmd.Parameters.AddWithValue("@last_write_time", fileInfo.LastWriteTime);
                                    insertCmd.Parameters.AddWithValue("@created_at", fileInfo.CreationTime);
                                    insertCmd.ExecuteNonQuery();
                                }
                            }

                            DirectorySearch(path);
                        }
                    } catch (Exception e) {
                        Console.WriteLine(e.Message);
                    }
                }
                // Start the search
                DirectorySearch(rootPath);
            }

           Fetch();
        }
    }
}