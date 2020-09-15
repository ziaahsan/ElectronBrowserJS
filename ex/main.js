"use strict";
// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron')

const { defaultWindowDetails, createWindow } = require('./components/window/create')
const { routes, windowOptions } = require('./components/window/options')

const requests = require('./components/window/requests')
const webbar = require('./components/window/webbar')

// Save main and webbar window instance here
let parentWindow = null, spotlightWindow = null, webbarWindow = null

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return
   switch (data.type) {
      case 'open-app':
         if (data.q.indexOf('http') === 0) {
            webbar.openWindow(data.q, windowOptions.childWindowOptions)
         }
         break;
      case 'switch-tab':
         let storageToken = data.q
         webbar.restoreWindow(storageToken)
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
   // Setup blank parent window
   parentWindow = createWindow(routes.blank.url, windowOptions.parentWindowOptions, routes.blank.icon)
   parentWindow.setSize(defaultWindowDetails.width, defaultWindowDetails.height)
   parentWindow.center()

   // Position for parent for aligning child windows
   let parentPosition = parentWindow.getPosition()
   
   // Setup spotlight settings and window
   spotlightWindow = createWindow(routes.index.url, windowOptions.spotlightWindowOptions, routes.index.icon)
   spotlightWindow.setSize(defaultWindowDetails.width, defaultWindowDetails.height - webbar.windowDetails.height)
   spotlightWindow.setPosition(parentPosition[0], parentPosition[1] + webbar.windowDetails.height)
   spotlightWindow.setParentWindow(parentWindow)

   // Setup the webbar settings and window
   webbar.webbarWindow = createWindow(routes.webbar.url, windowOptions.webbarWindowOptions, routes.webbar.icon)
   webbar.webbarWindow.setSize(webbar.windowDetails.width, webbar.windowDetails.height)
   webbar.webbarWindow.setPosition(parentPosition[0], parentPosition[1])
   webbar.webbarWindow.setParentWindow(parentWindow)
   webbar.webbarWindow.setFocusable(false)
   webbar.webbarWindow.setClosable(false)

   webbar.parentWindow = parentWindow

   // Update the webbar on initial setup
   webbar.webbarWindow.once('show', () => {
      // Updat the webbar
      webbar.update()
   })
})
