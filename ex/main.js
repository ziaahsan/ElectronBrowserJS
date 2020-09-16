"use strict";
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')
const requests = require('./components/window/requests');
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows()

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return

   let focusedWindow = browserWindows.getFocusedWindow()

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

// When app's ready...
app.on('ready', () => {
   // Setup the windowHandler settings and window
   browserWindows.setupInitialBrowserWindows()
})
