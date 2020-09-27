"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
let HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = 'webbar'
      let options = {
         backgroundColor: '#282828',
         // backgroundColor: '#e1e1e1',

         frame: false,
         transparent: false,

         focusable: true,
         resizable: true,

         closable: true,
         minimizable: true,
         maximizable: true,

         width: 1366,
         height: 768,

         webbarHeight: 77,
         padding: 6,

         center: true,
         parentBrowserWindow: null,
         position: null,

         thickFrame: 'WS_THICKFRAME',

         shadow: true
      }

      super(name, options)

      //Defaults
      this.browserWindow.windowId = name

      // Attach listeners
      this.browserWindow.on('maximize', this._onMaximize)
      this.browserWindow.webContents.on('ipc-message', this._onRestoreHttpWindows)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onRestoreHttpWindows = function (event, channel, type) {
      switch (channel) {
         case 'restore-http-windows':
            event.sender.send(channel, HttpBrowserWindow.getStoredWindows())
            break
         case 'close-webbar-window':
            this.browserWindow.close()
            break
         case 'maximize-webbar-window':
            this.browserWindow.maximize()
            break
         case 'minimize-webbar-window':
            this.browserWindow.minimize()
            break
      }
   }.bind(this)

   _onMaximize = function () {

   }.bind(this)
}
