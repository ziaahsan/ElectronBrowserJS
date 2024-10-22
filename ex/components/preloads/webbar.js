"use strict";
// ElectronJS IPC renderer for main process
const ipcRenderer = require('electron').ipcRenderer;

process.once('loaded', () => {
   // AngularJs message listeners
   window.addEventListener('message', event => {
      // Check event source
      if (event.source !== window) return;
      // Rquests with name are for ng for now
      if (event.data.type && event.data.name) return;

      // Event emitters to ipcMain
      switch (event.data.type) {
         case 'open-url':
            ipcRenderer.send(event.data.type, event.data.url, event.data.windowId);
            break;
         case 'open-window':
         case 'open-previous-page':
         case 'open-next-page':
         case 'close-window':
            ipcRenderer.send(event.data.type, event.data.windowId);
            break;
         case 'open-blank-window':
         case 'restore-http-windows':
         case 'close-webbar-window':
         case 'maximize-webbar-window':
         case 'minimize-webbar-window':
         case 'get-focused-window':
            ipcRenderer.send(event.data.type);
            break;
         case 'open-settings-menu':
            ipcRenderer.send(event.data.type, { x: 0, y: 0 });
            break;
         case 'find-in-focused-page':
         case 'stop-find-in-focused-page':
            ipcRenderer.send(event.data.type, event.data.searchTerm);
            break;
      }
   }, false)

   // API listerners
   ipcRenderer.on('stock-info', (event, data) => {
      let response = { type: 'stock-info', name: 'ng-webbar', results: data };
      window.postMessage(response);
   });

   // Attaching listeners
   ipcRenderer.on('restore-http-windows', (event, windows) => {
      let response = { type: 'restore', name: 'ng-webbar', results: windows };
      window.postMessage(response);
   });

   ipcRenderer.on('window-spinner', (event, httpWindowId, status) => {
      let message = { windowId: httpWindowId, isLoading: status };
      let response = { type: 'spinner', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('window-favicon', (event, httpWindowId, favicon) => {
      let message = { windowId: httpWindowId, favicon: favicon };
      let response = { type: 'favicon', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('window-title', (event, httpWindowId, title) => {
      let message = { windowId: httpWindowId, title: title };
      let response = { type: 'title', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('window-focus', (event, httpWindowId, title, url) => {
      let message = { windowId: httpWindowId, title: title, url: url };
      let response = { type: 'focus', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('window-maximized', (event, isMaximized) => {
      let message = { isMaximized: isMaximized };
      let response = { type: 'maximized', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('window-can-go-back', (event, httpWindowId, status) => {
      let message = { windowId: httpWindowId, canGoBack: status };
      let response = { type: 'can-go-back', name: 'ng-webbar', results: message };
      window.postMessage(response);
   });

   ipcRenderer.on('show-find-in-page', (event) => {
      let response = { type: 'search', name: 'ng-webbar' };
      window.postMessage(response);
   });

   ipcRenderer.on('show-find-in-page-results', (event, result) => {
      let response = { type: 'search-results', name: 'ng-webbar', found: result };
      window.postMessage(response);
   });
})
