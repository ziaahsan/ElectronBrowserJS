"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let id = 'webbar'
      let url = 'public/webbar.html'
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

      super(id, url, options)

      // Attach listeners
      this.browserWindow.on('will-move', this._onBrowserWindowWillMove)
   }

   sendResponse = function (name, response) {
      this.browserWindow.webContents.send('request-response', 'ng-webbar', name, response)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onBrowserWindowWillMove = async function (event, newBounds) {
      let browserWindow = this.browserWindow
      let webbarHeight = this.options.webbarHeight
      await new Promise(resolve => {
         for (let openedWindow of CustomBrowserWindow.openedWindows()) {
            // Move all except the current webbar@browserWindow
            if (openedWindow != browserWindow) {
               openedWindow.setPosition(newBounds.x, newBounds.y + webbarHeight)
            }
         }

         resolve()
      }).catch (e => {
         throw e.message
      })
   }.bind(this)
}