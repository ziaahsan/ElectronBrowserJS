"use strict";
// Path config abs
const path = require('path')
// Menu
const { Menu, MenuItem } = require('electron')
const menuIconPath = path.join(__dirname, '..', 'icons', 'menu')

// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
let HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = 'webbar'
      let options = {
         backgroundColor: '#282828',
         // backgroundColor: '#e1e1e1',

         frame: false,
         transparent: false,

         focusable: true,
         resizable: true,

         closable: true,
         minimizable: true,
         maximizable: true,

         width: 1366,
         height: 768,

         webbarHeight: 77,
         padding: 6,

         center: true,
         parentBrowserWindow: null,
         position: null,

         thickFrame: false,

         shadow: true
      }

      super(name, options)

      //Defaults
      this.browserWindow.windowId = name
      this.focusedBrowserWindow = null


      // Menu
      this.menu = new Menu()
      this.menu.append(new MenuItem({ label: 'New tab', accelerator: 'CmdOrCtrl+T' }))
      this.menu.append(new MenuItem({ label: 'Restore tab', accelerator: 'CmdOrCtrl+Shift+T' }))
      this.menu.append(new MenuItem({ label: 'Saved tabs', accelerator: 'CmdOrCtrl+Shift+B' }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Switch theme', icon: `${menuIconPath}/sun.png` }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({
         label: 'Print', accelerator: 'CmdOrCtrl+P',
         icon: `${menuIconPath}/print.png`,
         click: () => {
            console.log('time to print stuff')
         }
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'History', accelerator: 'CmdOrCtrl+H' }))
      this.menu.append(new MenuItem({ label: 'Downloads', accelerator: 'CmdOrCtrl+J', icon: `${menuIconPath}/download.png` }))
      this.menu.append(new MenuItem({
         label: 'Find in page',
         accelerator: 'CmdOrCtrl+F',
         icon: `${menuIconPath}/search.png`,
         click: () => {
            this.browserWindow.webContents.send('show-search')
         }
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Settings' }))
      this.menu.append(new MenuItem({ label: 'Help', accelerator: 'F1', icon: `${menuIconPath}/question.png` }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Exit' }))
      this.browserWindow.setMenu(this.menu)

      // Attach listeners
      this.browserWindow.on('maximize', this._onMaximize)
      this.browserWindow.webContents.on('ipc-message', this._onRestoreHttpWindows)
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onRestoreHttpWindows = function (event, channel, data) {
      switch (channel) {
         case 'restore-http-windows':
            event.sender.send(channel, HttpBrowserWindow.getStoredWindows())
            break
         case 'get-focused-window':
            if (!this.focusedBrowserWindow) return
            event.sender.send('window-focus', this.focusedBrowserWindow.windowId, this.focusedBrowserWindow.webContents.getTitle())
            break
         case 'close-webbar-window':
            this.browserWindow.close()
            break
         case 'maximize-webbar-window':
            this.browserWindow.maximize()
            break
         case 'minimize-webbar-window':
            this.browserWindow.minimize()
            break
         case 'open-settings-menu':
            let size = this.browserWindow.getContentSize()
            this.menu.popup({
               window: this.browserWindow,
               x: size[0] - 210,
               y: this.options.webbarHeight
            })
            break
      }
   }.bind(this)

   _onMaximize = function () {

   }.bind(this)
}
