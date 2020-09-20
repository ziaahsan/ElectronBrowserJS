"use strict";
// Setup is dev
const isDev = require('electron-is-dev')
// Path config abs
const path = require('path')
// Setup consts for window
const { BrowserWindow } = require('glasstron')
// Custom browser window using electron-glasstron
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
         parent: this.options.parentBrowserWindow,

         transparent: this.options.transparent,

         focusable: this.options.focusable,
         closable: this.options.closable,
         maximizable: this.maximizable,
         resizable: this.options.resizable,

         center: this.options.center,
         width: this.options.width,
         height: this.options.height,

         blur: this.options.blur,
         blurType: "blurbehind",
         vibrancy: "fullscreen-ui",

         hasShadow: this.options.shadow,

         webPreferences: {
            sandbox: true,
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
      // Setup ready, and wait
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadFile(this.url)
   }

   loadHttp = function () {
      // Setup ready, and wait
      this.browserWindow.once('ready-to-show', this._readyToShowListener)
      return this.browserWindow.loadURL(this.url)
   }
   
   // Setup the ready-to-show listener
   _readyToShowListener = function () {
      if (!this.browserWindow)
         throw "Something went wrong when loading the browser window?"
      
      if (isDev)
         this.browserWindow.webContents.openDevTools()

      this.browserWindow.show()
      this.browserWindow.focus()
   }.bind(this) //<-Add the scope of the class to function
}