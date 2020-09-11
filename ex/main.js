"use strict";
// Modules to control application life and create native browser window
const { app, globalShortcut, ipcMain } = require('electron')
const { createWindow } = require('./components/window/create')
const requests = require('./components/window/requests')

let routes = {
   index: 'public/index.html',
   webbar: 'public/webbar.html'
}

// Save main and webbar window instance here
let mainWindow = null, webbarWindow = null

// Setting up IPC
ipcMain.handle('ng-requests', async (event, data) => {
   if (!data.type) return
   // We're adding data to the reqeust
   // because in the requests.fetch we want to event.sender.send
   switch (data.type) {
      case 'open-app-in-window':
         if (data.q.indexOf('http') === 0) {
            let newAppWindow = createWindow(data.q, true, true)
            newAppWindow.setParentWindow(mainWindow)

            let response = []
            let childWindows = mainWindow.getChildWindows()
            childWindows.forEach((item, index) => {
               if (item.appName.indexOf('http') === 0) {
                  let info = {
                     appName: item.appName,
                     icon: `https://www.google.com/s2/favicons?sz=24&domain_url=${item.appName}`
                  }
                  response.push(info)
               }
            })

            // Send the webbar window an alert of open window
            webbarWindow.webContents.send('request-response', 'ng-webbar', 'open-apps', response);
         }
         break;
      case 'switch-app-window':
         if (data.q === 'main') {
            // Minimize all children windows which are 'apps'
            let childWindows = mainWindow.getChildWindows()
            childWindows.forEach((item, index) => {
               if (item.appName.indexOf('http') === 0) {
                  item.minimize()
               }
            })
         } else {
            // Minimize all children windows which are not 'appName'
            let childWindows = mainWindow.getChildWindows()
            childWindows.forEach((item, index) => {
               console.log(data.q, item.appName)
               if (item.appName != data.q && item.appName != routes.webbar) {
                  item.minimize()
               }
               if (item.appName === data.q) {
                  item.maximize()
               }
            })
         }
         break
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
   mainWindow = createWindow(routes.index, true, true)
   // Setup the webbar
   webbarWindow = createWindow(routes.webbar, false, false)
   webbarWindow.setSize(800, 52)
   webbarWindow.setPosition(560, 900)
   webbarWindow.setParentWindow(mainWindow)
   webbarWindow.setAlwaysOnTop(true)
})
