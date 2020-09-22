"use strict";
// ElectronJS IPC renderer for main process
const { ipcRenderer } = require('electron');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
process.once('loaded', () => {
   // Send it to IPC to handle the request
   window.addEventListener('message', event => {
      // Source, must be the same as well type and name both cant be present
      // @todo: As of now type + name = main.js requests maybe change for more readability
      if (event.source !== window || (event.data.type && event.data.name))
         return;

      // @todo: Sperate the invoke: https://github.com/atomery/juli/blob/master/src/senders/index.js
      ipcRenderer.invoke('ng-requests', event.data);
   }, false)

   // Send it forward to NG from IPC-Main
   // @todo: Setup listener like so: https://github.com/atomery/juli/blob/master/src/listeners/index.js
   ipcRenderer.on('request-response', (event, type, name, data) => window.postMessage({ type: type, name: name, results: data }));
})
