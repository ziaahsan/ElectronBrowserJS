"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor(parentWindow) {
      let id = 'webbar'
      let url = 'public/webbar.html'
      let options = {
         backgroundColor: '#ffffff',
         frame: false,
         transparent: false,

         focusable: false,
         closable: false,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 42,

         blur: false,

         center: false,

         parentBrowserWindow: parentWindow.browserWindow,
         position: {
            x: parentWindow.browserWindow.getPosition()[0],
            y: parentWindow.browserWindow.getPosition()[1]
         },

         shadow: false
      }

      super(id, url, options)
   }

   sendResponse = function (name, response) {
      this.browserWindow.webContents.send('request-response', 'ng-webbar', name, response)
   }
}