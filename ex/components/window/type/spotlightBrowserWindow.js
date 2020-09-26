"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
// Simply class for spotlight
module.exports = class SpotlightBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow) {
      let size = webbarWindow.browserWindow.getContentSize()

      let name = 'spotlight'
      let options = {
         backgroundColor: '#99000000',

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

      //Defaults
      this.browserWindow.windowId = name
      this.browserWindow.setContentSize(size[0], size[1] - webbarWindow.options.webbarHeight)

      // Webbar window object
      this.webbarWindow = webbarWindow
      this.webbarWindow.browserWindow.on('move', this._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.on('resize', this._onWebBarBrowserWindowResize)

      // BrowserWindow listeners
      this.browserWindow.on('focus', this._onBrowserWindowFocus)

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

   _onBrowserWindowFocus = function () {
      this.webbarWindow
         .browserWindow.webContents.send('window-title', this.browserWindow.windowId, this.browserWindow.webContents.getTitle())
   }.bind(this)

   _onWebBarBrowserWindowResize = function () {
      let size = this.webbarWindow.browserWindow.getContentSize()
      this.browserWindow.setContentSize(size[0], size[1] - this.webbarWindow.options.webbarHeight)
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      if (title === '') title = 'Untitled'
      this.webbarWindow
         .browserWindow.webContents.send('window-title', this.browserWindow.windowId, title)
   }.bind(this)
}
