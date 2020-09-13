"use strict";
// Setup storage for electron
const Store = require('electron-store')
const electronStore = new Store()

// Modules to control application life and create native browser window
const { app, globalShortcut, ipcMain } = require('electron')

const { createWindow } = require('./components/window/create')
const { routes, windowOptions } = require('./components/window/options')

const requests = require('./components/window/requests')
const webbar = require('./components/window/webbar')

// Save main and webbar window instance here
let parentWindow = null, spotlightWindow = null, webbarWindow = null

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return
   // We're adding data to the reqeust
   // because in the requests.fetch we want to event.sender.send
   switch (data.type) {
      case 'open-app':
         if (data.q.indexOf('http') === 0) {
            webbar.createNewWindow(parentWindow, webbarWindow, data.q, windowOptions.childWindowOptions)
         }
         break;
      case 'switch-app':
         let storageToken = data.q
         webbar.resotreWindow(storageToken, parentWindow, webbarWindow)
         break
      case 'select-programs':
      case 'select-folders':
         event.data = data
         requests.fetch(event)
         break
   }
})

// When app's ready...
app.on('ready', () => {
   // Setup blank parent window
   parentWindow = createWindow(routes.blank.url, windowOptions.parentWindowOptions, routes.blank.icon)

   // Setup spotlight
   spotlightWindow = createWindow(routes.index.url, windowOptions.spotlightWindowOptions, routes.index.icon)
   spotlightWindow.setParentWindow(parentWindow)

   // Setup the webbar
   webbarWindow = createWindow(routes.webbar.url, windowOptions.webbarWindowOptions, routes.webbar.icon)
   webbarWindow.setSize(800, 43)
   webbarWindow.setPosition(560, 900)
   webbarWindow.setParentWindow(parentWindow)
   webbarWindow.setAlwaysOnTop(true)
   webbarWindow.setClosable(false)
   webbarWindow.setFocusable(false)
   // Update the webbar on initial setup
   webbarWindow.once('show', () => {
      // Updat the webbar
      webbar.update(webbarWindow)
   })
})
