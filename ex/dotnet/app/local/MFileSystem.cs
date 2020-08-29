using System;
using System.IO;
using System.Collections.Generic;
using System.Security.Permissions;
using System.Text.Json;

namespace App.Local {
    class MFileSystem {

        public class MDirectioryInfo {
            public string Name { get; set; }
            public System.DateTime LastAccessTime { get; set; }
            public System.DateTime LastWriteTime { get; set; }
            public string Path { get; set; }
            public string Type { get; set; }
        }
        private static readonly String _path = @"C:\Users\Ahsan\AppData\Roaming\Microsoft\Windows\Start Menu";

        [PermissionSet(SecurityAction.Demand, Name = "FullTrust")]
        public static String GetDirectoriesWith(String pattern) {
            var json = "";
            
             try {
                DirectoryInfo root = new DirectoryInfo(_path);
                DirectoryInfo[] directories = root.GetDirectories($"*{pattern}*", SearchOption.AllDirectories);
                FileInfo[] files = root.GetFiles($"*{pattern}*", SearchOption.TopDirectoryOnly);

                List<MDirectioryInfo> mDirectioryInfos = new List<MDirectioryInfo>();
                foreach (DirectoryInfo directory in directories) {
                    MDirectioryInfo mDirectioryInfo = new MDirectioryInfo();
                    mDirectioryInfo.Name = directory.Name;
                    mDirectioryInfo.LastAccessTime = directory.LastAccessTimeUtc;
                    mDirectioryInfo.LastWriteTime = directory.LastWriteTime;
                    mDirectioryInfo.Path = directory.FullName;
                    mDirectioryInfo.Type = "Directory";

                    mDirectioryInfos.Add(mDirectioryInfo);
                }

                json = JsonSerializer.Serialize<List<MDirectioryInfo>>(mDirectioryInfos);
                
            } catch (Exception e) {
                Console.WriteLine("The process failed: {0}", e.ToString());
            }

            return json;
        }
    }
}