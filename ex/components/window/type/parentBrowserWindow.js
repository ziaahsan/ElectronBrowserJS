"use strict";
// Parent custom window
const CustomBrowserWindow = require('../custom/customBrowserWindow')
// Simply class for parent
module.exports = class ParentBrowserWindow extends CustomBrowserWindow {
   constructor() {
      let id = 'parent'
      let url = 'public/blank.html'
      let options = {
         backgroundColor: '#00000000',

         frame: false,
         transparent: true,

         focusable: true,
         resizable: false,

         closable: true,
         minimizable: true,
         maximizable: true,

         width: 1366,
         height: 768,

         center: true,
         parentBrowserWindow: null,
         position: null,

         shadow: true
      }

      super(id, url, options)
   }
}