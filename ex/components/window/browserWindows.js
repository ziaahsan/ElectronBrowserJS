"use strict";
// Type of custom BrowserWindows
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow');
const { async } = require('crypto-random-string');

// All type of browserWindows handler
module.exports = class BrowserWindows {
   constructor() {
      // Nothing...
   }

   createDefaultWindows = async function () {
      // Load webbar
      this.webbarWindow = new WebbarBrowserWindow()
      await this.webbarWindow.loadFile('public/webbar.html').then(res => {
         // Load spotlight
         this.loadSpotlight()
      }).catch(e => {
         console.error(e)
      })
   }

   loadSpotlight = async function() {
      // Load spotlight
      if (!this.spotlightWindow) {
         this.spotlightWindow = new SpotlightBrowserWindow(this.webbarWindow)
         this.spotlightWindow.browserWindow.on('closed', this._onSpotlightBrowserWindowClosed)
         await this.spotlightWindow.loadFile('public/index.html').catch(e => {
            console.error(e)
         })
      } else {
         this.spotlightWindow.browserWindow.focus()
      }
   }

   loadURL = async function (urlString, windowId = '') {
      // WebbarWindow, or spotlightWindow was null
      if (!this.webbarWindow || !this.spotlightWindow)
         throw "All default windows must be present."

      // Check to see a httpWindow exists
      if (!this.httpWindow || this.httpWindow.browserWindow.isDestroyed()) {
         this.httpWindow = new HttpBrowserWindow(this.webbarWindow, windowId)
         this.httpWindow.browserWindow.on('closed', this._onHttpBrowserWindowClosed)
      }

      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${encodeURIComponent(urlString)}`
      }

      this.httpWindow.browserWindow.focus()
      await this.httpWindow.loadHttp(urlString).catch(e => {
         console.error(e)
      })
   }

   setupHttpWindow = function (url, windowId = '') {
      return new Promise(async resolve => {
         this.httpWindow.browserWindow.destroy()
         // Wait for nullity of the window
         while (this.httpWindow !== null) {
            // Sleep 500ms interval until vairable is null
            await new Promise(resolve => setTimeout(resolve, 500));
         }

         this.loadURL(url, windowId)
         resolve()
      })
   }

   loadBlank = async function () {
      let url = 'https://google.ca'
      if (this.httpWindow) {
         await this.setupHttpWindow(url).catch(e => {
            console.error(e)
         })
         return
      }

      this.loadURL(url)
   }

   laodWindow = async function (windowId) {
      let storedWindow = HttpBrowserWindow.getStoredWindowById(windowId)
      if (!storedWindow.url) {
         storedWindow.url = 'https://google.ca'
      }

      if (this.httpWindow) {
         if (this.httpWindow.browserWindow.windowId === windowId) {
            this.httpWindow.browserWindow.focus()
            return
         }
         
         await this.setupHttpWindow(storedWindow.url, windowId).catch(e => {
            console.error(e)
         })
         
         return
      }

      this.loadURL(storedWindow.url, windowId)
   }

   loadPreviousPage = function(windowId) {
      if (windowId === 'webbar') return
      
      if (windowId === 'spotlight' && this.spotlightWindow) {
         if (this.spotlightWindow.browserWindow.webContents.canGoBack()) {
            this.spotlightWindow.browserWindow.webContents.goBack()
         }
      } else if (this.httpWindow) {
         if (this.httpWindow.browserWindow.webContents.canGoBack()) {
            this.httpWindow.browserWindow.webContents.goBack()
         }
      }
   }

   loadNextPage = function(windowId) {
      if (windowId === 'webbar') return

      if (windowId === 'spotlight' && this.spotlightWindow) {
         if (this.spotlightWindow.browserWindow.webContents.canGoForward()) {
            this.spotlightWindow.browserWindow.webContents.goForward()
         }
      } else if (this.httpWindow) {
         if (this.httpWindow.browserWindow.webContents.canGoForward()) {
            this.httpWindow.browserWindow.webContents.goForward()
         }
      }
   }

   //<summar>
   // Special listeners for instacnes
   //</summary>
   _onSpotlightBrowserWindowClosed = function () {
      this.webbarWindow.browserWindow.off('move', this.spotlightWindow._onWebBarBrowserWindowMove)
      this.spotlightWindow = null
   }.bind(this)

   _onHttpBrowserWindowClosed = function () {
      this.webbarWindow.browserWindow.off('move', this.httpWindow._onWebBarBrowserWindowMove)
      this.httpWindow = null
   }.bind(this)
}
