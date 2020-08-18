using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace App.Local {
    class Events {
        Process[] processes = Process.GetProcesses();

        public Events() {

        }

        public List<String> OnRunningApplications {
            get {
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