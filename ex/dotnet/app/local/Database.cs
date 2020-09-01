using System;
using System.Data.OleDb;
using System.Collections.Generic;

using Newtonsoft.Json;

namespace App.Local {
    class Database {
        private static OleDbConnection _connection = null;

        public static void OpenConnection() {
            _connection = new OleDbConnection("provider=Search.CollatorDSO.1;EXTENDED?PROPERTIES=\"Application=Windows\"");
            _connection.Open();
        }

        public static void CloseConnection() {
            if (IsConnectionActive())
                _connection.Close();
            _connection = null;
        }

        public static bool IsConnectionActive() {
            if (_connection != null && _connection.State != 0)
                return true;
            return false;
        }

        private static Dictionary<string, object> SerializeRow(IEnumerable<string> cols, OleDbDataReader reader) {
            var result = new Dictionary<string, object>();
            foreach (var col in cols) {
                // if (col.Contains("SYSTEM.ITEMPATHDISPLAY"))
                //     SaveIcon(reader["SYSTEM.ITEMPATHDISPLAY"].ToString(), reader["SYSTEM.THUMBNAILCACHEID"].ToString());
                result.Add(col, reader[col]);
            }
            return result;
        }

        public static IEnumerable<Dictionary<string, object>> Serialize(OleDbDataReader reader) {
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
                //@todo Prepare: https://docs.microsoft.com/en-us/dotnet/api/system.data.oledb.oledbparameter?view=dotnet-plat-ext-3.1
                using(OleDbCommand command = new OleDbCommand(query, _connection)) {
                    OleDbDataReader reader = command.ExecuteReader();
                    results = JsonConvert.SerializeObject(Serialize(reader), Formatting.Indented);
                }
            }
            read();
            return results;
        }
    }
}