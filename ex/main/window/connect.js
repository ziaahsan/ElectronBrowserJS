// Setting up configuration
const config = require('config')
const isDev = require('electron-is-dev')
// For dotNet connection
const { ConnectionBuilder } = require("electron-cgi")
var conn = null

class Connect {
    
    static build = () => {
        if (conn != null) {
            if (isDev) console.log("Another connection already active...")
            return
        }

        conn = new ConnectionBuilder()
            .connectTo(config.dotnet.path, config.dotnet.cmd.type, config.dotnet.cmd.args, config.dotnet.appPath)
            .build()
        
        conn.onDisconnect = () => {
            console.log("Connection Disconnected!")
            conn = null
        }
    }

    static recievedPrograms = async () => {
        if (conn == null) throw "Connect.js: No connection."
        
        return await new Promise((resolve, reject) => {
            conn.on('show-programs', res => resolve(res));
        })
    }
    
    static recievedFolders = async () => {
        if (conn == null) throw "Connect.js: No connection."
        
        return await new Promise((resolve, reject) => {
            conn.on('show-folders', res => resolve(res));
        })
    }

    static send = (requestType, name) => {
        if (conn == null) throw "Connect.js: No connection."
        conn.send(requestType, name);
    }

    static close = () => {
        if (conn == null) {
            if (isDev) console.log("There's no connection to close...")
            return
        }
        conn.close()
    }
}

module.exports = Connect