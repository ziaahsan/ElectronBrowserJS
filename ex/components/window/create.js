"use strict";
// Setup is dev
const isDev = require('electron-is-dev')
// Generate token use
const crypto = require('crypto-random-string')
// Setup storage for electron
const store = require('electron-store')
const electronStore = new store({accessPropertiesByDotNotation: false})
// Setup consts for window
const { BrowserWindow } = require('glasstron')
// Path config abs
const path = require('path')

// Window details
exports.defaultWindowDetails =  {
   width: 1366,
   height: 768
}

// Returns the focused window
exports.focusedWindow = () => {
   return BrowserWindow.getFocusedWindow()
}

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

   newWindow.windowOptions = options
   newWindow.windowKey = crypto({ length: 16, type: 'alphanumeric' })

   let storageToken = ""


   // URL based on:
   if (url.indexOf('public/') === 0) {
      newWindow.loadFile(url)
      storageToken = url
   } else {
      newWindow.loadURL(url)
      storageToken = crypto({ length: 8, type: 'alphanumeric' })
   }

   newWindow.once('ready-to-show', () => {
      if (isDev)
         newWindow.webContents.openDevTools()
      
      newWindow.show()
      newWindow.focus()
   })

   // When tab spinner stops
   newWindow.webContents.once('did-finish-load', () => {
      // Save window to the store
      if (options.saveWindowState) {
         newWindow.windowTitle = newWindow.webContents.getTitle()
         newWindow.windowURL = newWindow.webContents.getURL()
         if (options.saveWindowState)
            electronStore.set(storageToken, newWindow)
      }
   })

   newWindow.webContents.once('page-favicon-updated', (event, favicons) => {
      newWindow.windowIcon = favicons
         if (options.saveWindowState)
            electronStore.set(storageToken, newWindow)
   })

   newWindow.on('closed', () => {
      newWindow = null;
   })
   
   return newWindow;
}