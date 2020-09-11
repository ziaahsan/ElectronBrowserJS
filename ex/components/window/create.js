"use strict";
// Setup is dev
const isDev = require('electron-is-dev');

// Setup consts for window
const { globalShortcut } = require('electron')
const { BrowserWindow } = require('glasstron')

// Path config abs
const path = require('path')

// Set of windows
const windows = new Set()

// Window
exports.createWindow = (loadName, maximize, blur) => {
   let newWindow = null

   newWindow = new BrowserWindow({
      show: false,

      backgroundColor: "#000000000",
      frame: false,
      transparent: true,
      resizable: false,

      // skipTaskbar: true,

      blur: blur,
      blurType: "blurbehind",
      vibrancy: "fullscreen-ui",

      webPreferences: {
         worldSafeExecuteJavaScript: true,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js')
      }
   })

   if (loadName.indexOf('http') === 0) {
      newWindow.loadURL(loadName)
   } else {
      newWindow.loadFile(loadName)
   }

   if (maximize)
      newWindow.maximize()

   newWindow.once('ready-to-show', () => {
      if (isDev) newWindow.webContents.openDevTools()
      newWindow.show()
      newWindow.focus()
   })

   newWindow.on('closed', () => {
      windows.delete(newWindow)
      newWindow = null;
   })

   newWindow.appName = loadName

   windows.add(newWindow);
   return newWindow;
}
