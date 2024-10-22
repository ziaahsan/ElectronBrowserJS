"use strict";
// Menu
const { Menu, MenuItem, nativeTheme } = require('electron')
// Icon builder
const getIcon = require('../../lib/getIcon') 
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
const HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
class WebbarBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let name = process.env['WEBBAR_WINDOW_NAME']
      let options = {
         backgroundColor: '#FFFFFF',

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
         padding: 4,

         center: true,
         parentBrowserWindow: null,
         position: null,

         thickFrame: true,

         skipTaskbar: false,
         
         alwaysOnTop: false,
         modal: false,

         shadow: true
      }

      super(name, options)

      //Defaults
      this.browserWindow.windowId = name

      // History & Focus
      this.focusedHistory = []
      this.focused = {
         win: null,
         listener: function (browserWindow) { this.focusedHistory.push(browserWindow.windowId) }.bind(this),
         set browserWindow(win) {
            this.win = win
            this.listener(win)
         },
         get browserWindow() { return this.win },
         register: function (listener) { this.listener = listener }
      }

      // Menu
      this.menu = new Menu()
      this.menu.append(new MenuItem({ label: 'New Session'}))
      this.menu.append(new MenuItem({ label: 'Switch Session'}))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({
         label: 'Switch Theme',
         icon: getIcon('moon', 'png', '16'),
         click: function () {
            nativeTheme.themeSource = nativeTheme.themeSource === 'dark' ? 'light' : 'dark'
         }.bind(this)
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({
         label: 'Print',
         accelerator: 'CmdOrCtrl+P',
         icon: getIcon('print', 'png', '16'),
         click: () => {
            console.log('time to print stuff')
         }
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'History', accelerator: 'CmdOrCtrl+H' }))
      this.menu.append(new MenuItem({
         label: 'Downloads',
         accelerator: 'CmdOrCtrl+J',
         icon: getIcon('download', 'png', '16')
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Settings' }))
      this.menu.append(new MenuItem({
         label: 'Help',
         accelerator: 'F1',
         icon: getIcon('print', 'png', '16')
      }))
      this.menu.append(new MenuItem({ type: 'separator' }))
      this.menu.append(new MenuItem({ label: 'Exit' }))
      this.browserWindow.setMenu(null)

      // Attach listeners
      nativeTheme.on('updated', this._themeUpdated)
      // Issue #9: Adding can be maximize and unmaxize check
      this.browserWindow.on('maximize', this._onMaximized)
      this.browserWindow.on('unmaximize', this._onUnMaximized)
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
         url = new URL(this.focused.browserWindow.webContents.getURL())
         // url = `${url.protocol}//${url.hostname}`
         url = this.focused.browserWindow.webContents.getURL()
      } catch (e) {
         url = 'Omitted, not a valid URL or missing focused window.'
         console.log(e.messsage)
      }

      return url
   }

   //<summar>
   // All the listeners for this window
   //</summary>
   _themeUpdated = function() {

   }.bind(this)

   _onMaximized = function () {

   }.bind(this)

   _onUnMaximized = function () {

   }.bind(this)

   _onRestoreHttpWindows = function (event, channel) {
      if (channel !== 'restore-http-windows') return
      event.sender.send(channel, HttpBrowserWindow.getStoredWindows())
   }.bind(this)

   _onGetFocusedWindow = function (event, channel) {
      if (channel !== 'get-focused-window') return
      if (!this.focused.browserWindow) return
      event.sender.send('window-focus', this.focused.browserWindow.windowId,
         this.focused.browserWindow.webContents.getTitle(), this.makeFocusedWindowURL())
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
         x: size[0] - 180,
         y: this.options.webbarHeight
      })
   }.bind(this)
}

module.exports = WebbarBrowserWindow
