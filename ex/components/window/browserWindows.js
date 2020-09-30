"use strict";
// Type of custom BrowserWindows
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow');

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

   loadSpotlight = async function () {
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
      if (!this.webbarWindow || !this.spotlightWindow) {
         console.error("All default windows must be present.")
         return
      }

      let httpWindow = new HttpBrowserWindow(this.webbarWindow, windowId)
      httpWindow.browserWindow.webContents.on('new-window', this._onNewHttpWindow)

      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${encodeURIComponent(urlString)}`
      }

      httpWindow.browserWindow.focus()
      await httpWindow.loadHttp(urlString).catch(e => {
         console.error(e)
      })
   }

   loadBlank = function () {
      this.loadURL('https://google.ca')
   }

   laodWindow = async function (windowId) {
      let storedWindow = HttpBrowserWindow.getStoredWindowById(windowId)
      if (!storedWindow || !storedWindow.url) {
         this.loadURL('https://google.ca', windowId)
         return
      }

      await new Promise(resolve => {
         for (let childWindow of this.webbarWindow.browserWindow.getChildWindows()) {
            if (childWindow.windowId === windowId) {
               childWindow.focus()
               resolve(true)
               return
            }
         }

         resolve(false)
      }).then(result => {
         if (result) return
         this.loadURL(storedWindow.url, windowId)
      }).catch(e => {
         console.error(e)
      })
   }

   unloadWindow = async function (windowId) {
      await new Promise(resolve => {
         for (let childWindow of this.webbarWindow.browserWindow.getChildWindows()) {
            if (childWindow.windowId === windowId) {
               childWindow.destroy()
               HttpBrowserWindow.removeStoredWindowById(windowId)

               resolve(true)
               return
            }
         }

         HttpBrowserWindow.removeStoredWindowById(windowId)

         resolve(true)
      }).catch(e => {
         console.error(e)
      })
   }

   loadPreviousPage = async function (windowId) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (this.webbarWindow.focusedBrowserWindow.windowId !== windowId) return


      let focusedChild = this.webbarWindow.focusedBrowserWindow
      if (focusedChild.webContents.canGoBack())
         focusedChild.webContents.goBack()
   }

   loadNextPage = function (windowId) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (this.webbarWindow.focusedBrowserWindow.windowId !== windowId) return

      let focusedChild = this.webbarWindow.focusedBrowserWindow
      if (focusedChild.webContents.canGoForward())
         focusedChild.webContents.goForward()
   }

   findInFocusedPage = function (searchTerm) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (searchTerm === '') return

      this.webbarWindow.focusedBrowserWindow.webContents.findInPage(searchTerm)
   }

   stopFindInFocusedPage = function (action) {
      if (!this.webbarWindow || !this.webbarWindow.focusedBrowserWindow) return
      if (action === '')
         action = 'clearSelection'

      this.webbarWindow.focusedBrowserWindow.webContents.stopFindInPage(action)
   }

   //<summar>
   // Special listeners for instacnes
   //</summary>
   _onSpotlightBrowserWindowClosed = function () {
      this.webbarWindow.browserWindow.off('move', this.spotlightWindow._onWebBarBrowserWindowMove)
      this.webbarWindow.browserWindow.off('resize', this.spotlightWindow._onWebBarBrowserWindowResize)
      this.spotlightWindow = null
   }.bind(this)

   _onNewHttpWindow = function (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) {
      event.preventDefault()
      this.loadURL(url)
   }.bind(this)

}
