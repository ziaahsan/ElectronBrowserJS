"use strict";
// Setting up dev
const isDev = require('electron-is-dev')
// For dotNet connection
const { ConnectionBuilder } = require("electron-cgi")

// Setting up the connection with .Net
var conn = null


//@todo: async calls to try-catch
//@todo: convert check for conn != null to something like conn.active?
class Connect {

   // Building up .Net connection
   static build = () => {
      if (conn != null) {
         if (isDev) console.log("Another connection already active...")
         return
      }

      conn = new ConnectionBuilder()
         .connectTo("C:\\Program Files\\dotnet\\dotnet", "run", "--project", ".\\dotnet\\app")
         .build()

      conn.onDisconnect = () => {
         console.log("Connection Disconnected!")
         conn = null
      }
   }

   // Call coming in from (for now .Net)
   static recievedPrograms = async () => {
      if (conn == null) throw "Connect.js: No connection."

      return await new Promise((resolve, reject) => {
         conn.on('show-programs', res => resolve(res));
      })
   }

   // Call coming in from (for now .Net)
   static recievedFolders = async () => {
      if (conn == null) throw "Connect.js: No connection."

      return await new Promise((resolve, reject) => {
         conn.on('show-folders', res => resolve(res));
      })
   }

   // Call sent to (.Net)
   static send = (requestType, name) => {
      if (conn == null) throw "Connect.js: No connection."
      conn.send(requestType, name);
   }

   // Close the connection w/ .Net
   static close = () => {
      if (conn == null) {
         if (isDev) console.log("There's no connection to close...")
         return
      }
      conn.close()
   }
}

module.exports = Connect