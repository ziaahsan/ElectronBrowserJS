"use strict";
// Eelectron storage
const ElectronStore = require('electron-store');
const storage = new ElectronStore({ accessPropertiesByDotNotation: false, name: 'HttpBrowserWindows' });
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
// Simply class for spotlight
class SpotlightBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow) {
      let size = webbarWindow.browserWindow.getContentSize()

      let name = process.env['SPOTLIGHT_WINDOW_NAME']
      let options = {
         backgroundColor: '#00FFFFFF',

         frame: false,
         transparent: true,

         focusable: true,
         resizable: false,

         closable: false,
         minimizable: false,
         maximizable: false,

         width: webbarWindow.options.width,
         height: webbarWindow.options.height - webbarWindow.options.webbarHeight - webbarWindow.options.padding,

         center: false,
         parentBrowserWindow: webbarWindow.browserWindow,
         position: {
            x: webbarWindow.browserWindow.getPosition()[0] + webbarWindow.options.padding,
            y: webbarWindow.browserWindow.getPosition()[1] + webbarWindow.options.webbarHeight
         },

         thickFrame: false,

         shadow: false
      }

      super(name, options)

      //Defaults
      this.browserWindow.windowId = name
      this.browserWindow.setContentSize(size[0] - (webbarWindow.options.padding * 2), size[1] - webbarWindow.options.webbarHeight - webbarWindow.options.padding)

      // Webbar window object
      this.webbarWindow = webbarWindow
      this.webbarWindow.browserWindow.on('move', this._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.on('resize', this._onWebBarBrowserWindowResize)

      // BrowserWindow listeners
      this.browserWindow.on('focus', this._onBrowserWindowFocus)

      // WebContents listeners
      this.browserWindow.webContents.on('page-favicon-updated', this._pageFaviconUpdated)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
      this.browserWindow.webContents.on('did-navigate-in-page', this._didNavigateInPage)
      this.browserWindow.webContents.on('did-finish-load', this._didFinishLoad)

      // Initialize the window data to be stored
      storage.set(this.browserWindow.windowId, {})
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onWebBarBrowserWindowMove = function () {
      // Maybe this can delay? but for now works as expected.
      let webbarPosition = this.webbarWindow.browserWindow.getPosition()
      this.browserWindow.setPosition(webbarPosition[0] + this.webbarWindow.options.padding, webbarPosition[1] + this.webbarWindow.options.webbarHeight)
   }.bind(this)

   _onWebBarBrowserWindowResize = function () {
      let size = this.webbarWindow.browserWindow.getContentSize()
      this.browserWindow.setContentSize(size[0] - (this.webbarWindow.options.padding * 2), size[1] - this.webbarWindow.options.webbarHeight - this.webbarWindow.options.padding)
   }.bind(this)

   _onBrowserWindowFocus = function () {
      this.webbarWindow.focused.browserWindow = this.browserWindow
      this.webbarWindow
         .browserWindow.webContents.send('window-focus', this.browserWindow.windowId,
            this.browserWindow.webContents.getTitle(), this.webbarWindow.makeFocusedWindowURL())
   }.bind(this)

   _pageFaviconUpdated = function (event, favicons) {
      if (favicons.length > 0) {
         this.webbarWindow
            .browserWindow.webContents.send('window-favicon', this.browserWindow.windowId, favicons[0])

         let stored = storage.get(this.browserWindow.windowId)
         stored.favicon = favicons[0]
         storage.set(this.browserWindow.windowId, stored)
      }
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      if (title === '') title = 'Untitled'
      this.webbarWindow
         .browserWindow.webContents.send('window-title', this.browserWindow.windowId, title)
      
      let stored = storage.get(this.browserWindow.windowId)
      stored.title = title
      storage.set(this.browserWindow.windowId, stored)
   }.bind(this)

   _didNavigateInPage = function (event, url, isMainFrame, fromProcessId, frameRoutingId) {
      this.webbarWindow
         .browserWindow.webContents.send('window-can-go-back', this.browserWindow.windowId, this.browserWindow.webContents.canGoBack())
         
      let stored = storage.get(this.browserWindow.windowId)
      stored.url = url
      storage.set(this.browserWindow.windowId, stored)
   }.bind(this)

   _didFinishLoad = function () {
      this.webbarWindow
         .browserWindow.webContents.send('window-can-go-back', this.browserWindow.windowId, this.browserWindow.webContents.canGoBack())

      let stored = storage.get(this.browserWindow.windowId)
      stored.url = this.browserWindow.webContents.getURL()
      storage.set(this.browserWindow.windowId, stored)
   }.bind(this)
}

module.exports = SpotlightBrowserWindow
