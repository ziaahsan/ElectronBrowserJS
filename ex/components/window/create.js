"use strict";
// Setup is dev
const isDev = require('electron-is-dev');

// Setup consts for window
const { globalShortcut } = require('electron')
const { BrowserWindow } = require('glasstron')

// Path config abs
const path = require('path')

// Set of windows
const windows = new Set();

// Window
exports.createWindow = (loadName) => {
   let newWindow = null

   newWindow = new BrowserWindow({
      show: false,

      backgroundColor: "#000000000",
      frame: false,
      transparent: true,
      resizable: false,

      // skipTaskbar: true,

      blur: true,
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

   newWindow.maximize()

   newWindow.once('ready-to-show', () => {
      // if (isDev) newWindow.webContents.openDevTools()
      newWindow.show()
   });

   newWindow.on('closed', () => {
      windows.delete(newWindow);
      newWindow = null;
   });

   windows.add(newWindow);
   return newWindow;
}

// module.exports = (app) => {
//   // app.commandLine.appendSwitch("enable-transparent-visuals")

//   app.on('ready', () => {
//     this.createWindow()
//   })
//   app.whenReady().then(() => {
//     createWindow()

//     // if (isDev)
//     //     mainWindow.webContents.openDevTools()
//     app.on('activate', function() {
//       // On macOS it's common to re-create a window in the app when the
//       // dock icon is clicked and there are no other windows open.
//       if (BrowserWindow.getAllWindows().length === 0) createWindow()
//     })
//   })

//   app.on('will-quit', function() {})

//   // Quit when all windows are closed, except on macOS. There, it's common
//   // for applications and their menu bar to stay active until the user quits
//   // explicitly with Cmd + Q.
//   app.on('window-all-closed', function() {
//     if (process.platform !== 'darwin') app.quit()
//   })
// }
