"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor(parentWindow) {
      let id = 'webbar'
      let url = 'public/webbar.html'
      let options = {
         backgroundColor: '#00000000',

         frame: false,
         transparent: false,

         focusable: false,
         resizable: false,

         closable: false,
         minimizable: false,
         maximizable: false,

         width: parentWindow.options.width,
         height: 42,

         center: false,
         parentBrowserWindow: parentWindow.browserWindow,
         position: {
            x: parentWindow.browserWindow.getPosition()[0],
            y: parentWindow.browserWindow.getPosition()[1]
         },

         shadow: false
      }

      super(id, url, options)

      // Attach listeners
      this.browserWindow.on('move', this._onBrowserWindowMove)
   }

   sendResponse = function (name, response) {
      this.browserWindow.webContents.send('request-response', 'ng-webbar', name, response)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onBrowserWindowMove = function () {
      let position = this.browserWindow.getPosition()
      for (let openedWindow of CustomBrowserWindow.openedWindows()) {
         // Move all except the current webbar@browserWindow
         if (openedWindow != this.browserWindow) {
            if (openedWindow.windowId !== 'parent') {
               openedWindow.setPosition(position[0], position[1] + this.options.height)
            } else {
               openedWindow.setPosition(position[0], position[1])
            }
         }
      }
   }.bind(this)
}