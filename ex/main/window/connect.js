const isDev = require('electron-is-dev');
// For dotNet connection
const { ConnectionBuilder } = require("electron-cgi");
var conn = null
class Connect {
    
    static build = () => {
        if (conn != null) {
            if (isDev)
                console.log("Another connection already active...")
            return
        }
        conn = new ConnectionBuilder()
            .connectTo("C:\\Program Files\\dotnet\\dotnet", "run", "--project", ".\\dotnet\\app")
            .build()
        conn.onDisconnect = () => {
            console.log("Connection Disconnected")
            conn = null
        }
    }

    static send = async (requestType, name) => {
        if (conn == null) {
            if (isDev)
                console.log("Please enable a connection before sending message...")
            return
        }

        return new Promise((resolve, reject) => {
            conn.send(requestType, name, (err, res) => {
                if (err) {
                    if (isDev)
                        console.log(error)
                    reject("[Error] An error occured, if your a dev please look into this.")
                    return;
                }
                conn.close()
                resolve(res)
            })
        })
        // new Promise (
        //     conn.send(requestType, name, (err, res) => {
        //         if (err) {
        //             if (isDev)
        //                 console.log(error)
        //             return;
        //         }
        //         conn.close()
        //         console.log("1.", res)
        //         return res
        //     })
        // )
    }

    static close = () => {
        if (conn == null) {
            if (isDev)
                console.log("There's no connection to close...")
            return
        }
        conn.close()
    }
}

module.exports = Connect