"use strict";
// Setup is dev
const isDev = require('electron-is-dev')
// Path config abs
const path = require('path')
// Setup consts for window
const { BrowserWindow } = require('electron')

// Custom browser window using electron
module.exports = class CustomBrowserWindow {
   constructor(id, url, options) {
      // Defaults
      this.id = id
      this.url = url
      this.options = options

      // Electron-Glasstron BrowserWindow
      this.browserWindow = new BrowserWindow({
         show: false,

         backgroundColor: this.options.backgroundColor,

         frame: this.options.frame,
         transparent: this.options.transparent,

         focusable: this.options.focusable,
         // @https://www.electronjs.org/docs/api/frameless-window#transparent-window
         // Setting resizable to true may make a transparent window stop working on some platforms.
         resizable: this.options.transparent ? false : this.options.resizable,

         closable: this.options.closable,
         minimizable: this.options.minimizable,
         maximizable: this.maximizable,

         width: this.options.width,
         height: this.options.height,

         center: this.options.center,
         parent: this.options.parentBrowserWindow,

         hasShadow: this.options.shadow,

         webPreferences: {
            devTools: isDev,
            spellcheck: true,
            sandbox: true,
            plugins: true,
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
         }
      })

      // Setup position according to options
      if (this.options.position !== null)
         this.browserWindow.setPosition(this.options.position.x, this.options.position.y)

      // Attach the windowId to this browserWindow since when
      // accessing getChildren we need to know what our window id is (besides @BrowserWindow.id)
      this.browserWindow.windowId = this.id
   }

   loadFile = function () {
      // Setup ready, and return promise
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadFile(this.url)
   }

   loadHttp = function () {
      // Setup ready, and return promise
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadURL(this.url)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _readyToShowListener = function () {
      if (!this.browserWindow)
         throw "Something went wrong with the browser window!?!"

      this.browserWindow.show()
      this.browserWindow.focus()
   }.bind(this) //<-Add the scope of the class to function


   //<summar>
   // Class static methods, for quick access to some of the electron.browserWindow functions and more to add
   //</summary>
   static openedWindows = function () {
      return BrowserWindow.getAllWindows()
   }

   static focusedWindow = function () {
      return BrowserWindow.getFocusedWindow()
   }
}