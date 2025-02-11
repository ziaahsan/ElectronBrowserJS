"use strict";
// Setup is dev
const isDev = require('electron-is-dev')
// Path config abs
const path = require('path')
// Setup consts for window
const { BrowserWindow } = require('electron')

// Custom browser window using electron
class CustomBrowserWindow {
   constructor(name, options) {
      // Defaults
      this.name = name
      this.options = options

      // Electron BrowserWindow
      this.browserWindow = new BrowserWindow({
         title: this.name,
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

         minWidth: 880,
         // Issue #8: minHeight set to same as plain window size
         minHeight: 768,

         width: this.options.width,
         height: this.options.height,

         center: this.options.center,
         parent: this.options.parentBrowserWindow,

         titleBarStyle: 'hidden',
         thickFrame: this.options.thickFrame,

         skipTaskbar: this.options.skipTaskbar,
         
         alwaysOnTop: this.options.alwaysOnTop,
         modal: this.options.modal,

         hasShadow: this.options.shadow,

         webPreferences: {
            devTools: true,
            spellcheck: true,
            sandbox: true,
            plugins: true,
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, '..', '..', 'preloads', `${this.name}.js`)
         }
      })

      // Setup position according to options
      if (this.options.position !== null)
         this.browserWindow.setPosition(this.options.position.x, this.options.position.y)
   }

   loadFile = function (url) {
      // Setup ready, and return promise
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadFile(url)
   }

   loadHttp = function (url) {
      // Setup ready, and return promise
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadURL(url)
   }

   //<summar>
   // All the static methods
   //</summary>
   static focusedWindow = function() {
      return BrowserWindow.getFocusedWindow()
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
}

module.exports = CustomBrowserWindow
