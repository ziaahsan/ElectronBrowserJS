"use strict";
//
const crypto = require('crypto-random-string')
// Eelectron storage
const ElectronStore = require('electron-store');
const storage = new ElectronStore({ accessPropertiesByDotNotation: false, name: 'HttpBrowserWindows' });
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')

// Simply class for any http browser window
module.exports = class HttpBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow, windowId) {
      let name = 'http'
      let options = {
         backgroundColor: '#FFF',

         frame: false,
         transparent: false,

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

      // Defaults
      this.browserWindow.windowId = windowId === '' ? crypto({ length: 8, type: 'alphanumeric' }) : windowId

      // Webbar window object
      this.webbarWindow = webbarWindow
      this.webbarWindow.browserWindow.on('move', this._onWebBarBrowserWindowMove)
      
      // BrowserWindow listeners
      this.browserWindow.on('close', this._onBrowserWindowClose)

      // Webcontents listeners
      this.browserWindow.webContents.on('did-start-loading', this._didSpinnerStartLoading)
      this.browserWindow.webContents.on('did-stop-loading', this._didSpinnerStopLoading)
      this.browserWindow.webContents.on('page-favicon-updated', this._pageFaviconUpdated)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
      this.browserWindow.webContents.on('did-navigate-in-page', this._didNavigateInPage)
      this.browserWindow.webContents.on('did-finish-load', this._didFinishLoad)

      // Initialize the window data to be stored
      storage.set(this.browserWindow.windowId, {})
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
      let stored = storage.get(this.browserWindow.windowId)
      stored.url = url
      storage.set(this.browserWindow.windowId, stored)
   }.bind(this)

   _didFinishLoad = function () {
      let stored = storage.get(this.browserWindow.windowId)
      stored.url = this.browserWindow.webContents.getURL()
      storage.set(this.browserWindow.windowId, stored)
   }.bind(this)
}
