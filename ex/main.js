"use strict";
// Setup path
const path = require('path')
// Generate token use
const crypto = require('crypto-random-string')
// Modules to control application life and create native browser window
const { app, ipcMain, session, remote } = require('electron')
// ContextMenu
const contextMenu = require('electron-context-menu')
contextMenu()
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()
// Setup ad-blocker
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')
// Setup fs promises for ad-blocker caching
const fsPromises = require('fs').promises;

// Setting up IPC for Windows
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return

   // Setup the focused for all cases
   let focusedWindow = browserWindows.focusedWindow()

   // Fire up based on which type of data
   switch (data.type) {
      case 'create-new-window-indicator':
         let windowId = crypto({ length: 8, type: 'alphanumeric' })
         browserWindows.webbarWindow.sendResponse(data.type, { windowId: windowId, searchTerm: data.searchTerm })
         break
      case 'create-new-http-window':
         browserWindows.createHttpWindow(data.windowId, data.windowURL)
         break
      case 'focus-window':
         browserWindows.switchFocusTo(data.windowId)
         break
      case 'can-focus-window-go-back':
         if (focusedWindow === null)
            return

         if (focusedWindow.webContents.canGoBack())
            focusedWindow.webContents.goBack()
         break
      case 'can-focus-window-go-forward':
         if (focusedWindow === null)
            return

         if (focusedWindow.webContents.canGoForward())
            focusedWindow.webContents.goForward()
         break
   }
})

// When app's initialized
app.whenReady().then(async () => {
   // Electron ad-blocker
   ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: path.join(app.getPath('userData'), 'adblocker.bin'),
      read: fsPromises.readFile,
      write: fsPromises.writeFile,
   }).then((blocker) => {
      // Setup blocker for session
      blocker.enableBlockingInSession(session.defaultSession);
      // Setup windows
      browserWindows.createDefaultWindows()
   });
})

// Whenever new browserWindows.switchFocusTo is set or by default window is focused
app.on('browser-window-focus', (event, window) => {
   if (!window.windowId) return
   browserWindows.webbarWindow.sendResponse('focus-window', { windowId: window.windowId })
})