using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace App.Local {
    class Events {

        public static readonly String[] VALID_NAMES = {
            "RunningApps"
        };

        public static List<String> OnRunningApplications {
            get {
                Process[] processes = Process.GetProcesses();
                List<String> titles = new List<String>();
                foreach(Process p in processes) {
                    if(!String.IsNullOrEmpty(p.MainWindowTitle)) {
                        titles.Add(p.MainWindowTitle);
                    }
                }
                return titles;
            }
        }
    }
}