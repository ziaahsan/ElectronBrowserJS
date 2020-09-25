"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
let HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = 'webbar'
      let options = {
         backgroundColor: '#FFF',

         frame: false,
         transparent: true,

         focusable: true,
         resizable: false,

         closable: true,
         minimizable: true,
         maximizable: false,

         width: 1366,
         height: 768,

         webbarHeight: 42,

         center: true,
         parentBrowserWindow: null,
         position: null,

         shadow: false
      }

      super(name, options)

      //Defaults
      this.browserWindow.windowId = name
      
      // Attach listeners
      this.browserWindow.webContents.on('ipc-message', this._onRestoreHttpWindows)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onRestoreHttpWindows = function (event, channel, type) {
      if (channel === 'restore-http-windows')
         event.sender.send(channel, HttpBrowserWindow.getStoredWindows())
   }.bind(this)
}
