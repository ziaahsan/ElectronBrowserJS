"use strict";
// Menu
const { Menu, MenuItem } = require('electron')
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
let HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
module.exports = class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = process.env['WEBBAR_WINDOW_NAME']
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
      this.menu.append(new MenuItem({ label: 'Switch theme', icon: `${process.env['MENU_ICONS_PATH']}/sun.png` }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({
         label: 'Print', accelerator: 'CmdOrCtrl+P',
         icon: `${process.env['MENU_ICONS_PATH']}/print.png`,
         click: () => {
            console.log('time to print stuff')
         }
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'History', accelerator: 'CmdOrCtrl+H' }))
      this.menu.append(new MenuItem({ label: 'Downloads', accelerator: 'CmdOrCtrl+J', icon: `${process.env['MENU_ICONS_PATH']}/download.png` }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Settings' }))
      this.menu.append(new MenuItem({ label: 'Help', accelerator: 'F1', icon: `${process.env['MENU_ICONS_PATH']}/question.png` }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Exit' }))
      this.browserWindow.setMenu(this.menu)

      // Attach listeners
      this.browserWindow.webContents.on('ipc-message', this._onRestoreHttpWindows)
      this.browserWindow.webContents.on('ipc-message', this._onGetFocusedWindow)
      this.browserWindow.webContents.on('ipc-message', this._onCloseThisWindow)
      this.browserWindow.webContents.on('ipc-message', this._onMaximizeThisWindow)
      this.browserWindow.webContents.on('ipc-message', this._onMinimizeThisWindow)
      this.browserWindow.webContents.on('ipc-message', this._onOpenSettingsMenus)
   }

   makeFocusedWindowURL = function () {
      let url = ''

      try {
         url = new URL(this.focusedBrowserWindow.webContents.getURL())
         let protocol = url.protocol
         let hostname = url.hostname
         url = `${protocol}//${hostname}`
      } catch {
         url = 'Omitted, not a valid URL'
      }

      return url
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _onRestoreHttpWindows = function (event, channel) {
      if (channel !== 'restore-http-windows') return
      event.sender.send(channel, HttpBrowserWindow.getStoredWindows())
   }.bind(this)

   _onGetFocusedWindow = function (event, channel) {
      if (channel !== 'get-focused-window') return
      if (!this.focusedBrowserWindow) return
      event.sender.send('window-focus', this.focusedBrowserWindow.windowId,
         this.focusedBrowserWindow.webContents.getTitle(), this.makeFocusedWindowURL())
   }.bind(this)

   _onCloseThisWindow = function (event, channel) {
      if (channel !== 'close-webbar-window') return
      this.browserWindow.close()
   }.bind(this)

   _onMaximizeThisWindow = function (event, channel) {
      if (channel !== 'maximize-webbar-window') return
      this.browserWindow.maximize()
   }.bind(this)

   _onMinimizeThisWindow = function (event, channel) {
      if (channel !== 'minimize-webbar-window') return
      this.browserWindow.minimize()
   }.bind(this)

   _onOpenSettingsMenus = function (event, channel) {
      if (channel !== 'open-settings-menu') return
      let size = this.browserWindow.getContentSize()
      this.menu.popup({
         window: this.browserWindow,
         x: size[0] - 210,
         y: this.options.webbarHeight
      })
   }.bind(this)
}
