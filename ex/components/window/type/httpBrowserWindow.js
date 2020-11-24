"use strict";
// Random string
const crypto = require('crypto-random-string')
// Eelectron storage
const ElectronStore = require('electron-store');
const storage = new ElectronStore({ accessPropertiesByDotNotation: false, name: 'HttpBrowserWindows' });
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')

// Simply class for any http browser window
class HttpBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow, windowId) {
      let size = webbarWindow.browserWindow.getContentSize()

      let name = 'http'
      let options = {
         backgroundColor: '#FFFFFF',

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

         skipTaskbar: false,
         
         shadow: false
      }

      super(name, options)

      // Defaults
      this.browserWindow.favicon = ''
      this.browserWindow.windowId = windowId === '' ? crypto({ length: 8, type: 'alphanumeric' }) : windowId
      this.browserWindow.setContentSize(size[0] - (webbarWindow.options.padding * 2), size[1] - webbarWindow.options.webbarHeight - webbarWindow.options.padding)

      // Webbar window object
      this.webbarWindow = webbarWindow
      this.webbarWindow.browserWindow.on('move', this._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.on('resize', this._onWebBarBrowserWindowResize)

      // BrowserWindow listeners
      this.browserWindow.on('closed', this._onHttpBrowserWindowClosed)
      this.browserWindow.on('focus', this._onBrowserWindowFocus)

      // Webcontents listeners
      this.browserWindow.webContents.on('did-start-loading', this._didSpinnerStartLoading)
      this.browserWindow.webContents.on('did-stop-loading', this._didSpinnerStopLoading)
      this.browserWindow.webContents.on('page-favicon-updated', this._pageFaviconUpdated)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
      this.browserWindow.webContents.on('did-navigate-in-page', this._didNavigateInPage)
      this.browserWindow.webContents.on('did-finish-load', this._didFinishLoad)
      this.browserWindow.webContents.on('found-in-page', this._onFoundInPage)
   }

   //<summar>
   // All the static methods
   //</summary>
   static getStoredWindows = function () {
      return JSON.parse(JSON.stringify(storage.store))
   }

   static getStoredWindowById = function (id) {
      return storage.get(id)
   }

   static removeStoredWindowById = function (id) {
      storage.delete(id)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onWebBarBrowserWindowMove = function () {
      let webbarPosition = this.webbarWindow.browserWindow.getPosition()
      this.browserWindow.setPosition(webbarPosition[0] + this.webbarWindow.options.padding, webbarPosition[1] + this.webbarWindow.options.webbarHeight)
   }.bind(this)

   _onWebBarBrowserWindowResize = function () {
      let size = this.webbarWindow.browserWindow.getContentSize()
      this.browserWindow.setContentSize(size[0] - (this.webbarWindow.options.padding * 2), size[1] - this.webbarWindow.options.webbarHeight - this.webbarWindow.options.padding)
   }.bind(this)

   _onHttpBrowserWindowClosed = function () {
      this.webbarWindow.browserWindow.off('move', this._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.off('resize', this._onWebBarBrowserWindowResize)

      this.browserWindow.removeAllListeners()
   }.bind(this)

   _onBrowserWindowFocus = function () {
      this.webbarWindow.focused.browserWindow = this.browserWindow
      this.webbarWindow
         .browserWindow.webContents.send('window-focus', this.browserWindow.windowId,
            this.browserWindow.webContents.getTitle(), this.webbarWindow.makeFocusedWindowURL())
   }.bind(this)

   _didSpinnerStartLoading = function () {
      this.webbarWindow
         .browserWindow.webContents.send('window-spinner', this.browserWindow.windowId, true)
   }.bind(this)

   _didSpinnerStopLoading = function () {
      this.webbarWindow
         .browserWindow.webContents.send('window-spinner', this.browserWindow.windowId, false)
   }.bind(this)

   _pageFaviconUpdated = function (event, favicons) {
      if (favicons.length > 0) {
         this.webbarWindow
            .browserWindow.webContents.send('window-favicon', this.browserWindow.windowId, favicons[0])
         this.browserWindow.favicon = favicons[0]
      }
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      if (title === '') title = 'Untitled'
      this.webbarWindow
         .browserWindow.webContents.send('window-title', this.browserWindow.windowId, title)

      // Update the focused window with this window since its the same
      if (this.browserWindow.windowId === this.webbarWindow.focused.browserWindow.windowId) {
         this.webbarWindow
         .browserWindow.webContents.send('window-focus', this.browserWindow.windowId,
            this.browserWindow.webContents.getTitle(), this.webbarWindow.makeFocusedWindowURL())
      }
   }.bind(this)

   _didNavigateInPage = function (event, url, isMainFrame, fromProcessId, frameRoutingId) {
      this.webbarWindow
         .browserWindow.webContents.send('window-can-go-back', this.browserWindow.windowId, this.browserWindow.webContents.canGoBack())
   }.bind(this)

   _didFinishLoad = function () {
      this.webbarWindow
         .browserWindow.webContents.send('window-can-go-back', this.browserWindow.windowId, this.browserWindow.webContents.canGoBack())
   }.bind(this)

   _onFoundInPage = function (event, result) {
      this.webbarWindow
         .browserWindow.webContents.send('show-find-in-page-results', result)
   }.bind(this)
}

module.exports = HttpBrowserWindow
