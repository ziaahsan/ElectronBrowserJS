"use strict";
// URL 
const url = require('url')
// Custom BrowserWindows
const ParentBrowserWindow = require('./type/parentBrowserWindow')
const WebbarBrowserWindow = require('./type/webbarBrowserWindow')
const SpotlightBrowserWindow = require('./type/spotlightBrowserWindow')
const HttpBrowserWindow = require('./type/httpBrowserWindow')
// Setup consts for window
const { BrowserWindow } = require('glasstron')

// All type of browserWindows handler
module.exports = class BrowserWindows {
   constructor() {
      // Nothing...
   }

   //<summary>
   // Load the windows in an async-manner instead of all at-once
   //</summary>
   createDefaultWindows = async function () {
      try {
         // Load parent
         this.parentWindow = new ParentBrowserWindow()
         await this.parentWindow.loadFile()
      } catch {
         throw "Parent window was unable to load!"
      }

      // Parent was null or something^^handled above but still
      if (!this.parentWindow)
         throw "Parent is null or not defined!?"

      try {
         // Load webbar
         this.webbarWindow = new WebbarBrowserWindow(this.parentWindow)
         await this.webbarWindow.loadFile()
      } catch {
         throw "Webbar window was unable to load!"
      }

      try {
         // Load spotlight
         this.spotlightWindow = new SpotlightBrowserWindow(this.parentWindow, this.webbarWindow)
         await this.spotlightWindow.loadFile()
      } catch {
         throw "Spotlight window was unable to load!"
      }

      try {
         // Restoring saved window
         await HttpBrowserWindow.restoreAllWindowsFromStorage(this.webbarWindow)
      } catch {
         throw "Couldn't restore http windows from storage!"
      }
   }

   //<summary>
   // Create the requested http window based httpUR
   //</summary>
   createHttpWindow = function (windowId, urlString) {
      // Parent, webbarWindow, or spotlightWindow was null or something return
      if (!this.parentWindow || !this.webbarWindow || !this.spotlightWindow)
         throw "All default windows must be present."
      
      try {
         // Check and see if URL is valid, proceed
         new URL(urlString)
      } catch {
         // Setup default url to google search
         urlString = `https://www.google.com/search?q=${urlString}`
      }

      // All httpBrowserWindows require webbar aside from parent
      // @Important windowId must be supplied from client(angular-js) that will be used to tag the window
      new HttpBrowserWindow(this.parentWindow, this.webbarWindow, windowId, urlString).create()
   }

   //<summary>
   // Get the current focused window (this returns the current active window may it be parentWindow, spotlightWindow, httpWindow, etc.)
   //</summary>
   focusedWindow = function () {
      return BrowserWindow.getFocusedWindow()
   }

   //<summary>
   // Shows and focuses the child window with @windowId
   //</summary>
   focusTo = function (windowId) {
      return new Promise ((resolve, reject) => {
         for (let openedWindow of BrowserWindow.getAllWindows()) {
            if (openedWindow.windowId == windowId) {
               openedWindow.show()
               openedWindow.focus()
               resolve()
               return
            }
         }
         
         let storedWindow = HttpBrowserWindow.savedWindow(windowId)
         if (storedWindow.lastURL === undefined) {
            reject()
            return
         }

         this.createHttpWindow(windowId, storedWindow.lastURL)
         resolve()
      })
   }
}