"use strict";
// Eelectron storage
const ElectronStore = require('electron-store');
const storage = new ElectronStore({ accessPropertiesByDotNotation: false, name: 'HttpBrowserWindows' });
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')

// Simply class for any http browser window
module.exports = class HttpBrowserWindow extends CustomBrowserWindow {
   constructor(parentWindow, webbarWindow, windowId, httpURL) {
      let id = windowId
      let url = httpURL
      let options = {
         backgroundColor: '#ffffff',
         frame: false,
         transparent: false,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 726,

         blur: false,

         center: false,

         parentBrowserWindow: parentWindow.browserWindow,
         position: {
            x: parentWindow.browserWindow.getPosition()[0],
            y: parentWindow.browserWindow.getPosition()[1] + 42
         },

         shadow: false
      }

      super(id, url, options)

      // Webbar window object
      this.webbarWindow = webbarWindow
   }

   create = async function () {
      // Attach listeners
      this.browserWindow.on('close', this._onBrowserWindowClose)
      this.browserWindow.webContents.on('did-start-navigation', this._didStartNavigation)
      this.browserWindow.webContents.on('did-start-loading', this._didSpinnerStartLoading)
      this.browserWindow.webContents.on('did-stop-loading', this._didSpinnerStopLoading)
      this.browserWindow.webContents.on('page-favicon-updated', this._pageFavIconUpdated)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)

      try {
         // Load this.url window
         await this.loadHttp()
      } catch {
         throw `http window-${this.id} was unable to load with ${this.url}!`
      }
   }

   // Returns data on stored window
   static savedWindow = function(windowId) {
      return storage.get(windowId)
   }

   // Restores all windows on the webbar
   static restoreAllWindowsFromStorage = function (webbarWindow) {
      return new Promise (resolve => {
         const windows = JSON.parse(JSON.stringify(storage.store))
         Object.keys(windows).forEach(windowId => {
            const savedWindow = windows[windowId]
            // Send the tab to be created with its info
            webbarWindow.sendResponse('restore-window-indicator', { windowId: windowId, favIcon: savedWindow.favIcon })
         })
         resolve()
      })
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onBrowserWindowClose = function () {
      this.webbarWindow.sendResponse('close-window', { windowId: this.id })
      storage.delete(this.id)
   }.bind(this)

   _didStartNavigation = function (event, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) {
      storage.set(this.id, { lastURL: url })
   }.bind(this)

   _didSpinnerStartLoading = function () {
      let response = { updateType: 'spinner', windowId: this.id, isLoading: true }
      this.webbarWindow.sendResponse('update-window', response)
   }.bind(this)

   _didSpinnerStopLoading = function () {
      let response = { updateType: 'spinner', windowId: this.id, isLoading: false }
      this.webbarWindow.sendResponse('update-window', response)
   }.bind(this)

   _pageFavIconUpdated = function (event, favIcons) {
      if (favIcons.length > 0) {
         let response = { updateType: 'favIcon', windowId: this.id, favIcon: favIcons[0] }
         this.webbarWindow.sendResponse('update-window', response)

         storage.set(this.id, { lastURL: this.browserWindow.webContents.getURL(), favIcon: favIcons[0] })
      }
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      let response = { updateType: 'title', windowId: this.id, title: title }
      this.webbarWindow.sendResponse('update-window', response)
   }.bind(this)
}