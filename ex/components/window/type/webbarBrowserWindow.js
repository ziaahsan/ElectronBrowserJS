"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
let HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = 'webbar'
      let options = {
         backgroundColor: '#00000000',

         frame: false,
         transparent: true,

         focusable: true,
         resizable: false,

         closable: false,
         minimizable: false,
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

      // Attach listeners
      this.browserWindow.on('show', this._onShow)
   }

   restoreHttpStoredWindow = function () {
      this.browserWindow.webContents.send('restore-http-windows', HttpBrowserWindow.getStoredWindows())
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onShow = function () {
      this.restoreHttpStoredWindow()
   }.bind(this)
}
