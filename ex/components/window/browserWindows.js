"use strict";
// URL
const url = require('url')
// Setup consts for window
const CustomBrowserWindow = require('./custom/customBrowserWindow')
// Custom BrowserWindows
const ParentBrowserWindow = require('./type/parentBrowserWindow')
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow')

// All type of browserWindows handler
module.exports = class BrowserWindows {
   constructor() {
      // Nothing...
   }

   createDefaultWindows = async function () {
      // Load parent
      this.parentWindow = new ParentBrowserWindow()
      await this.parentWindow.loadFile().catch(e => {
         throw e.message
      })

      // Parent was null or something^^handled above but still
      if (!this.parentWindow)
         throw "Parent is null or not defined!?"

      // Load webbar
      this.webbarWindow = new WebbarBrowserWindow(this.parentWindow)
      await this.webbarWindow.loadFile().catch(e => {
         throw e.message
      })


      // Load spotlight
      this.spotlightWindow = new SpotlightBrowserWindow(this.parentWindow, this.webbarWindow)
      await this.spotlightWindow.loadFile().catch(e => {
         throw e.message
      })

      // Restoring saved window
      await HttpBrowserWindow.restoreAllWindowsFromStorage(this.webbarWindow).catch(e => {
         throw e.message
      })
   }

   createHttpWindow = function (windowId, urlString) {
      // Parent, webbarWindow, or spotlightWindow was null or something return
      if (!this.parentWindow || !this.webbarWindow || !this.spotlightWindow)
         throw "All default windows must be present."

      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${encodeURIComponent(urlString)}`
      }

      // All httpBrowserWindows require webbar aside from parent
      // @Important windowId must be supplied from client(angular-js) that will be used to tag the window
      new HttpBrowserWindow(this.parentWindow, this.webbarWindow, windowId, urlString).create()
   }

   switchFocusTo = async function (windowId) {
      // By doing promise we can check for several things:
      // 1. Check if the window is already among the open windows
      // 2. If 1's not it, we can check if the window is among the saved windows
      // 3. If 2's not the case either we can create that window as long as window url is present,
      //    and windowId was already present. We'll just use this windowId to create a new httpWindow
      // Otherwise reject
      return new Promise((resolve, reject) => {
         for (let openedWindow of CustomBrowserWindow.openedWindows()) {
            if (openedWindow.windowId == windowId) {
               openedWindow.show()
               openedWindow.focus()
               resolve()
               return
            }
         }

         let storedWindow = HttpBrowserWindow.getSavedWindow(windowId)
         if (storedWindow.url !== undefined) {
            this.createHttpWindow(windowId, storedWindow.url)
            resolve()
            return
         }
         
         reject("Invalid windowId or nothing to do here!")
      }).catch(e => {
         throw e.message
      })
   }

   focusedWindow = function () {
      // Gets the currently focused window
      return CustomBrowserWindow.focusedWindow()
   }
}