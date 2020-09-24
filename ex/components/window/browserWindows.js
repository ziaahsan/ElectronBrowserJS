"use strict";
// Type of custom BrowserWindows
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow')

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

      await this.httpWindow.loadHttp(urlString).then(res => {
         this.httpWindow.browserWindow.focus()
      }).catch(e => {
         console.error(e)
      })
   }

   laodWindow = async function (windowId) {
      let storedWindow = HttpBrowserWindow.getStoredWindowById(windowId)
      if (!storedWindow.url) return

      if (this.httpWindow) {
         if (this.httpWindow.browserWindow.windowId === windowId) {
            this.httpWindow.browserWindow.focus()
            return
         }
         
         await new Promise(async resolve => {
            this.httpWindow.browserWindow.destroy()
            // Wait for nullity of the window
            while (this.httpWindow !== null) {
               // Sleep 500ms interval until vairable is null
               await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.loadURL(storedWindow.url, windowId)
            resolve()
         }).catch(e => {
            console.error(e)
         })
         
         return
      }

      this.loadURL(storedWindow.url, windowId)
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
