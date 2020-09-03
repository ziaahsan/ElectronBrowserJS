"use strict";
// ElectronJS IPC renderer for main process
const { ipcRenderer } = require('electron')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once('loaded', () => {
  // Send it to IPC to handle the request
  window.addEventListener('message', event => {
    if (event.source != window) return

    // If event is from source
    ipcRenderer.invoke('add-requests', event.data)
  }, false)

  // Send it forward to NG from IPC
  //@todo: Check if windows.post is the correct way to broadcast as of now this broad cast the data to everything...
  //@todo: Answer to above todo: https://stackoverflow.com/questions/36286592/how-to-integrate-electron-ipcrenderer-into-angular-2-app-based-on-typescript
  ipcRenderer.on('add-request-response', (event, requestName, requestData) => window.postMessage({type: "SPOTLIGHT_REQUEST", name:requestName, results:requestData}))
})
