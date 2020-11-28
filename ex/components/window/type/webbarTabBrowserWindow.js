"use strict";
// Menu
const { Menu, MenuItem, nativeTheme } = require('electron')
// Icon builder
const getIcon = require('../../lib/getIcon') 
// Parent custom window
const CustomBrowserWindow = require('../custom/browserWindow')
const HttpBrowserWindow = require('./httpBrowserWindow')

// Simply class for webbar
class WebbarTooltipBrowserWindow extends CustomBrowserWindow {
   constructor(webbarWindow) {
      let name = process.env['WEBBAR_TOOLTIP_WINDOW_NAME']
      let options = {
         backgroundColor: '#FFFFFF',

         frame: false,
         transparent: true,

         focusable: false,
         resizable: true,

         closable: false,
         minimizable: false,
         maximizable: false,

         width: 768,
         height: 77,

         webbarHeight: 77,
         padding: 4,

         center: true,
         parentBrowserWindow: webbarWindow.browserWindow,
         position: {
            x: parseInt(webbarWindow.browserWindow.getSize()[0] / 2),
            y: parseInt(webbarWindow.browserWindow.getSize()[1] / 2)
         },

         thickFrame: false,

         skipTaskbar: false,

         alwaysOnTop: true,
         modal: false,

         shadow: true
      }

      super(name, options)
   }
}

module.exports = WebbarTooltipBrowserWindow
