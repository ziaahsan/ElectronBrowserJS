"use strict";
// Generate token use
const crypto = require('crypto-random-string')
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()

// Setting up IPC for Windows
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return

   // Setup the focused for all cases
   let focusedWindow = browserWindows.focusedWindow()

   // Fire up based on which type of data
   switch (data.type) {
      case 'create-new-window-indicator':
         let windowId = crypto({ length: 8, type: 'alphanumeric' })
         browserWindows.webbarWindow.sendResponse(data.type, {windowId: windowId, searchTerm: data.searchTerm})
         break
      case 'create-new-http-window':
         browserWindows.createHttpWindow(data.windowId, data.windowURL)
         break
      case 'focus-window':
         (async () => {
            try {
               await browserWindows.focusTo(data.windowId)
            } catch {
               throw `Couldn't focus to requested window-${data.window.id}`
            }
         })()
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
app.whenReady().then(() => {
   browserWindows.createDefaultWindows()
})

// Whenever new browserWindows.focusTo is set or by default window is focused
app.on('browser-window-focus', (event, window) => {
   if (!window.windowId) return
   browserWindows.webbarWindow.sendResponse('focus-window', {windowId: window.windowId})
})