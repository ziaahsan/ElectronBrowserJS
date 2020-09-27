"use strict";
// ElectronJS IPC renderer for main process
const ipcRenderer = require('electron').ipcRenderer;

process.once('loaded', () => {
   // AngularJs message listeners
   window.addEventListener('message', event => {
      // Check event source
      if (event.source !== window) return
      // Rquests with name are for ng for now
      if (event.data.type && event.data.name) return

      // Event emitters to ipcMain
      switch (event.data.type) {
         case 'open-window':
         case 'open-previous-page':
         case 'open-next-page':
         case 'close-window':
            ipcRenderer.send(event.data.type, event.data.windowId)
            break;
         case 'open-spotlight':
         case 'open-blank-window':
         case 'restore-http-windows':
         case 'close-webbar-window':
         case 'maximize-webbar-window':
         case 'minimize-webbar-window':
            ipcRenderer.send(event.data.type)
            break;
      }
   }, false)

   // Attaching listeners
   ipcRenderer.on('restore-http-windows', (event, windows) => {
      let response = { type: 'restore', name: 'ng-webbar', results: windows }
      window.postMessage(response)
   })

   ipcRenderer.on('window-spinner', (event, httpWindowId, status) => {
      let message = { windowId: httpWindowId, isLoading: status }
      let response = { type: 'spinner', name: 'ng-webbar', results: message }
      window.postMessage(response)
   })

   ipcRenderer.on('window-favicon', (event, httpWindowId, favicon) => {
      let message = { windowId: httpWindowId, favicon: favicon }
      let response = { type: 'favicon', name: 'ng-webbar', results: message }
      window.postMessage(response)
   })

   ipcRenderer.on('window-title', (event, httpWindowId, title) => {
      let message = { windowId: httpWindowId, title: title }
      let response = { type: 'title', name: 'ng-webbar', results: message }
      window.postMessage(response)
   })
})
