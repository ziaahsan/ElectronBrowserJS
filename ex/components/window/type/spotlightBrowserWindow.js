"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
// Simply class for spotlight
module.exports = class SpotlightBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow) {
      let name = 'spotlight'
      let options = {
         backgroundColor: '#90000000',

         frame: false,
         transparent: true,

         focusable: true,
         resizable: false,

         closable: false,
         minimizable: false,
         maximizable: false,

         width: webbarWindow.options.width,
         height: webbarWindow.options.height - webbarWindow.options.webbarHeight,

         center: false,
         parentBrowserWindow: webbarWindow.browserWindow,
         position: {
            x: webbarWindow.browserWindow.getPosition()[0],
            y: webbarWindow.browserWindow.getPosition()[1] + webbarWindow.options.webbarHeight
         },

         shadow: false
      }

      super(name, options)

      // Webbar window object
      this.webbarWindow = webbarWindow
      this.webbarWindow.browserWindow.on('move', this._onWebBarBrowserWindowMove)

      // BrowserWindo listeners
      this.browserWindow.on('close', this._onBrowserWindowClose)

      // WebContents listeners
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onWebBarBrowserWindowMove = function () {
      // Maybe this can delay? but for now works as expected.
      let webbarPosition = this.webbarWindow.browserWindow.getPosition()
      this.browserWindow.setPosition(webbarPosition[0], webbarPosition[1] + this.webbarWindow.options.webbarHeight)
   }.bind(this)

   _onBrowserWindowClose = function () {

   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {

   }.bind(this)
}
