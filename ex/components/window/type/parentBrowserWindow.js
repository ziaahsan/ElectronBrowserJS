"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for parent
module.exports = class ParentBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let id = 'parent'
      let url = 'public/blank.html'
      let options = {
         backgroundColor: '#ffffff',
         frame: true,
         transparent: false,

         focusable: true,
         closable: true,
         maximizable: true,
         resizable: false,

         width: 1366,
         height: 768,

         blur: false,

         center: true,
         parentBrowserWindow: null,
         position: null,

         shadow: true
      }

      super(id, url, options)
   }
}