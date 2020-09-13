"use strict";
// Setup is dev
const isDev = require('electron-is-dev')
// Generate token use
const crypto = require('crypto-random-string')
// Setup storage for electron
const Store = require('electron-store')
const electronStore = new Store({accessPropertiesByDotNotation: false})
// Setup consts for window
const { globalShortcut } = require('electron')
const { BrowserWindow } = require('glasstron')

// Path config abs
const path = require('path')

// Window
exports.createWindow = (url, options, icon=null) => {
   let newWindow = null

   newWindow = new BrowserWindow({
      show: false,

      backgroundColor: options.backgroundColor,
      frame: false,
      transparent: options.transparent,
      resizable: false,

      // skipTaskbar: true,

      blur: options.blur,
      blurType: "blurbehind",
      vibrancy: "fullscreen-ui",

      webPreferences: {
         worldSafeExecuteJavaScript: true,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js')
      }
   })

   newWindow.windowURL = url
   newWindow.windowOptions = options
   newWindow.windowKey = crypto({ length: 16, type: 'alphanumeric' })

   if (url.indexOf('http') === 0) {
      var key = crypto({ length: 16, type: 'alphanumeric' })
      const host = new URL(url).host
      newWindow.loadURL(url)
      newWindow.windowName = host
      newWindow.windowIcon = `https://www.google.com/s2/favicons?sz=24&domain_url=${host}`
   } else {
      var key = url
      newWindow.loadFile(url)
      newWindow.windowName = url
      newWindow.windowIcon = icon
   }

   if (options.maximize)
      newWindow.maximize()

   newWindow.once('ready-to-show', () => {
      if (isDev) newWindow.webContents.openDevTools()
      newWindow.show()
      newWindow.focus()
   })

   newWindow.on('closed', () => {
      newWindow = null;
   })

   // Save window to the store
   if (options.saveWindowState) {
      electronStore.set(key, newWindow)
   }

   return newWindow;
}