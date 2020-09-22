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
         backgroundColor: '#FFF',

         frame: false,
         transparent: false,

         focusable: true,
         resizable: false,

         closable: true,
         minimizable: false,
         maximizable: false,

         width: parentWindow.options.width,
         height: parentWindow.options.height - webbarWindow.options.height,

         center: false,
         parentBrowserWindow: parentWindow.browserWindow,
         position: {
            x: parentWindow.browserWindow.getPosition()[0],
            y: parentWindow.browserWindow.getPosition()[1] + webbarWindow.options.height
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
      this.browserWindow.webContents.on('did-start-loading', this._didSpinnerStartLoading)
      this.browserWindow.webContents.on('did-stop-loading', this._didSpinnerStopLoading)
      this.browserWindow.webContents.on('page-favicon-updated', this._pageFavIconUpdated)
      this.browserWindow.webContents.on('page-title-updated', this._pageTilteUpdated)
      this.browserWindow.webContents.on('did-finish-load', this._didFinishLoad)

      // Load this.url window
      await this.loadHttp().catch(e => {
         throw e.message
      })
   }

   saveWindowInfoToStorage = async function (type, value) {
      // Save info
      let windowId = this.id
      await new Promise(resolve => {
         let windowInfo = storage.get(windowId, {})
         windowInfo[type] = value

         storage.set(windowId, windowInfo)
         resolve()
      }).catch(e => {
         console.error(`[Storage] Could not set window-${this.id} storage correctly due to: ${e.message}`)
      })
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onBrowserWindowClose = function () {
      this.webbarWindow.sendResponse('close-window', { windowId: this.id })
      storage.delete(this.id)
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

         this.saveWindowInfoToStorage('favIcon', favIcons[0])
      }
   }.bind(this)

   _pageTilteUpdated = function (event, title, explicitSet) {
      let response = { updateType: 'title', windowId: this.id, title: title }
      this.webbarWindow.sendResponse('update-window', response)
   }.bind(this)

   _didFinishLoad = function () {
      this.saveWindowInfoToStorage('url', this.browserWindow.webContents.getURL())
   }.bind(this)


   //<summar>
   // Class static methods, for quick access to some of the storage data
   //</summary>
   static getSavedWindow = function (windowId) {
      // Returns data on stored window
      return storage.get(windowId)
   }

   static restoreAllWindowsFromStorage = function (webbarWindow) {
      // Restores all windows on the webbar
      return new Promise(resolve => {
         const windows = JSON.parse(JSON.stringify(storage.store))
         Object.keys(windows).forEach(windowId => {
            const savedWindow = windows[windowId]
            // Send the tab to be created with its info
            webbarWindow.sendResponse('restore-window-indicator', { windowId: windowId, favIcon: savedWindow.favIcon })
         })
         resolve()
      })
   }
}