"use strict";
// Modules to control application life and create native browser window
const { app, globalShortcut, ipcMain } = require('electron')
const { createWindow } = require('./components/window/create')
const requests = require('./components/window/requests')

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return
   // We're adding data to the reqeust
   // because in the requests.fetch we want to event.sender.send
   switch (data.type) {
      case 'select-programs':
      case 'select-folders':
         event.data = data
         requests.fetch(event)
         break
   }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('ready', () => {
   createWindow('public/index.html')
})
