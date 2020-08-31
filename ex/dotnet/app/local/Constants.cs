using System;

namespace App.Local {
    class Constants {
        public static readonly String ROOT_SEARCH_DIR = @"C:\";

        public static readonly String LOG_DIR = @".\logs";
        public static readonly String SERVICES_LOG_FILE = $"{LOG_DIR}\\services.log";
        public static readonly String ELECTRON_LOG_FILE = $"{LOG_DIR}\\electron-cgi.log";

        public static readonly String CACHE_DIR = @".\cache";
        public static readonly String CACHE_FILE_WATCHER = $"{CACHE_DIR}\\file-watcher.txt";
        public static readonly String CACHE_ICONS = $"{CACHE_DIR}\\icons";
    }
}