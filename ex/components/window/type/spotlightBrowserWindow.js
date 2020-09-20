"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for spotlight
module.exports = class SpotlightBrowserWindow extends CustomBrowserWindow {
   constructor(parentWindow, webbarWindow) {
      let id = 'spotlight'
      let url = 'public/index.html'
      let options = {
         backgroundColor: '#000000000',
         frame: false,
         transparent: true,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 726,

         blur: true,

         center: false,

         parentBrowserWindow: parentWindow.browserWindow,
         position: {
            x: parentWindow.browserWindow.getPosition()[0],
            y: parentWindow.browserWindow.getPosition()[1] + 42
         },

         shadow: false
      }

      super(id, url, options)

      // Webbar window object
      this.webbarWindow = webbarWindow

      // Attach listeners
      this.browserWindow.on('close', this._onBrowserWindowClose)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
   }

    //<summar>
   // All the listeners for this window
   //</summary>
   _onBrowserWindowClose = function () {
      this.webbarWindow.sendResponse('close-window', {windowId: this.id})
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      let response = { updateType: 'title', windowId: this.id, title: title }
      this.webbarWindow.sendResponse('update-window', response)
   }.bind(this)
}