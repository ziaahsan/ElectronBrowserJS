"use strict";
// Session app partition
const partition = 'persist:app'
// Setup path
const path = require('path')
// Custom requests
const requests = require('./components/window/requests');
// Modules to control application life and create native browser window
const { protocol, app, session, ipcMain } = require('electron')
// Setup the browserWindows instance
const BrowserWindows = require('./components/window/browserWindows');
let browserWindows = new BrowserWindows(partition)

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

// Register custom protocols for node, resoruces and app files
protocol.registerSchemesAsPrivileged([
   { scheme: 'app', privileges: { secure: true, corsEnabled: true } },
   { scheme: 'node', privileges: { secure: true, corsEnabled: true } },
]);

// When app's ready...
app.whenReady().then(() => {
   const sess = session.fromPartition(partition)

   sess.cookies.on('changed', (event, cookie, cause, removed) => {
      console.log(cookie)
   })

   sess.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['origin'] = 'app://';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

   sess.protocol.registerFileProtocol('app', (request, callback) => {
      const url = request.url.substr(6)
      callback({ path: path.normalize(`${__dirname}/public/${url}`) })
   })

   sess.protocol.registerFileProtocol('node', (request, callback) => {
      const url = request.url.substr(7)
      callback({ path: path.normalize(`${__dirname}/${url}`) })
   })

   browserWindows.setupInitialBrowserWindows()
})

// When app has changed window focus
app.on('browser-window-focus', (event, window) => {
   let tabInfo = {
      tabId: window.tabId,
      title: window.title,
   }

   browserWindows.sendWebbar('focused-tab', tabInfo)
})

app.on('will-quit', () => {
   //@todo: Setup session storage here
})