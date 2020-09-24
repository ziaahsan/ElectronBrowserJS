// ElectronJS IPC renderer for main process
const ipcRenderer = require('electron').ipcRenderer;
process.once('loaded', () => {
   // AngularJs message listeners
   window.addEventListener('message', event => {
      // Check event source
      if (event.source !== window) return;

      // Event emitters to ipcMain
      if (event.data.type === 'open-url') {
         ipcRenderer.send(event.data.type, event.data.url);
      }
   }, false)
})