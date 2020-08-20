using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Data.SQLite;

using Microsoft.Win32;
using Newtonsoft.Json;

namespace App.Local {
    class Events {
        public static String OnRunningApplications {
            get {
                Process[] processes = Process.GetProcesses();
                List<String> titles = new List<String>();
                foreach (Process p in processes) {
                    if (String.IsNullOrEmpty(p.MainWindowTitle)) return "";
                }
                return JsonConvert.SerializeObject(titles);
            }
        }

        public static void CacheBrowserData() {
            void History(String path) {
                File.Copy(path, @"..\..\cache\History", true);
                SQLiteConnection conn = new SQLiteConnection (@"Data Source=..\..\cache\History");
                SQLiteCommand cmd = new SQLiteCommand();

                conn.Open();
                cmd.Connection = conn;
                cmd.CommandText = "Select * From urls";
                SQLiteDataReader dr = cmd.ExecuteReader();
                using (FileStream fs = File.Create(@".\cache\history.txt")) {
                    while (dr.Read()) {
                        Console.WriteLine(dr[1].ToString());
                        break;
                    }
                }
                conn.Close();
            }

            History(@"C:\Users\Ahsan\AppData\Local\Google\Chrome\User Data\Default\History");
        }

        public static void CacheInstalledApplications() {
            Dictionary<String, List<Dictionary<String, String>>> data = new Dictionary<String, List<Dictionary<String, String>>>();
            List<Dictionary<String, String>> items = new List<Dictionary<String, String>>();

            void Fetch() {
                // Search in: CurrentUser
                String registryKey = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(registryKey)) {
                    foreach (String subkeyName in key.GetSubKeyNames()) {
                        using (RegistryKey subkey = key.OpenSubKey(subkeyName)) {       
                            Extract(subkey);
                        }
                    }
                }

                // Search in: LocalMachine
                registryKey = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registryKey)) {
                    foreach (String subkeyName in key.GetSubKeyNames()) {
                        using (RegistryKey subkey = key.OpenSubKey(subkeyName)) {
                            Extract(subkey);
                        }
                    }
                }

                // Search in: LocalMachine_64
                registryKey = @"SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall";
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registryKey)) {
                    foreach (String subkeyName in key.GetSubKeyNames()) {
                        using (RegistryKey subkey = key.OpenSubKey(subkeyName)) {
                            Extract(subkey);
                        }
                    }
                }

                data.Add("apps", items);
                Cache();
            }

            void Extract(RegistryKey subkey) {
                if (String.IsNullOrEmpty(subkey.GetValue("DisplayName") as String)) return;
                Dictionary<String, String> attr = new Dictionary<string, string>();

                attr.Add("name", subkey.GetValue("DisplayName") as String);
                attr.Add("iconPath", subkey.GetValue("DisplayIcon") as String);
                attr.Add("version", subkey.GetValue("DisplayVersion") as String);
                attr.Add("installedPath", subkey.GetValue("InstallLocation") as String);
                attr.Add("installedDate", subkey.GetValue("InstallDate") as String);
                attr.Add("publisher", subkey.GetValue("Publisher") as String);

                items.Add(attr);
            }
            
            void Cache() { 
                using (FileStream fs = File.Create(@".\cache\applications.json")) {
                    byte[] info = new System.Text.UTF8Encoding(true).GetBytes(JsonConvert.SerializeObject(data, Formatting.Indented));
                    fs.Write(info, 0, info.Length);
                }
            }

            // Start process...
            Fetch();
        }
    }
}