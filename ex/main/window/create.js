"use strict";
// Setup is dev
const isDev = require('electron-is-dev');

// Setup consts for window
const { globalShortcut } = require('electron')
const { BrowserWindow } = require('glasstron')

// path config abs
const path = require('path')

let mainWindow = null
let hidden = false

module.exports = (app) => {
  app.commandLine.appendSwitch("enable-transparent-visuals")
  app.whenReady().then(() => {
    createWindow()
    function createWindow ()  {
      mainWindow = new BrowserWindow({
        backgroundColor: "#00000000",
        frame: false,
        transparent: true,
        resizable: true,

        minHeight: 900,
        minWidth: 600,
        
        // skipTaskbar: true,
  
        blur: true,
        blurType: "blurbehind",
        vibrancy: "fullscreen-ui",

        webPreferences: {
          worldSafeExecuteJavaScript: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        }
      })
  
      mainWindow.loadFile('public/index.html')
      mainWindow.maximize()

      // Register a 'ctrl+space' shortcut listener.
      let ret = globalShortcut.register('ctrl+space', () => {
        if (!hidden) {
          mainWindow.hide()
        } else {
          mainWindow.show()
        }

        hidden = !hidden
      })

      if ((!ret || !globalShortcut.isRegistered('ctrl+space')) && isDev)
        console.log('ctrl+space shortcut failed!')
  
      if (isDev)
        mainWindow.webContents.openDevTools()
    }

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
}
  