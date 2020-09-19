"use strict";
// Setup path
const path = require('path')
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
// Custom requests
const requests = require('./components/window/requests');
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return

   // Get the focused window so we perform actions
   let focusedWindow = browserWindows.getFocusedBrowserWindow()

   // Fire up based on which type of data
   switch (data.type) {
      case 'create-tab':
         browserWindows.createTab(data.q)
         break
      case 'switch-tab':
         browserWindows.switchTab(data.q)
         break
      case 'can-go-back':
         if (focusedWindow === null) return
         if (focusedWindow.webContents.canGoBack())
            focusedWindow.webContents.goBack()
         break
      case 'can-go-forward':
         if (focusedWindow === null) return
         if (focusedWindow.webContents.canGoForward())
            focusedWindow.webContents.goForward()
         break

      case 'select-programs':
      case 'select-folders':
         // We're adding data to the reqeust
         // because in the requests.fetch we want to event.sender.send
         event.data = data
         requests.fetch(event)
         break
   }
})

// When app's initialized
app.whenReady().then(() => {
   browserWindows.setupInitialBrowserWindows()
})

// When app has changed window focus
// @todo changes this maybe to somethign else??
app.on('browser-window-focus', (event, window) => {
   let tabInfo = {
      tabId: window.tabId,
      title: window.title,
   }

   browserWindows.sendWebbar('focused-tab', tabInfo)
})

app.on('will-quit', async () => {
   //@todo: Setup session storage here
})