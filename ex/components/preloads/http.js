"use strict";
// ElectronJS IPC renderer for main process
const ipcRenderer = require('electron').ipcRenderer;

process.once('loaded', () => {
   async function stocktwitWatchlist () {
      let watchlist = document.querySelector('.lib_2v558Qh.lib_3UzYkI9.lib_n3oDk1j.lib_3PxyMmd > div');
      let data = []
      while(watchlist === null) {
         await new Promise(function(resolve) { setTimeout(resolve, 3000) });
         watchlist = document.querySelector('.lib_2v558Qh.lib_3UzYkI9.lib_n3oDk1j.lib_3PxyMmd > div');
         if (watchlist !== null) {
            const observer = new MutationObserver(function (mutations) {
               stocktwitWatchlist();
            });
            observer.observe(watchlist, {
               characterData: true, attributes: false, childList: true, subtree: true 
            });
         }
      }

      for(let node of watchlist.children) {
         let info = {
            symbol: node.querySelector('.lib_2up57f0.lib_2VeBY8x.lib_2WawZPB.lib_65XwjLA.lib_10OTPLG.lib_3Wb397t').textContent,
            name: node.querySelector('.lib_1M1dHLR.lib_1LUBAjF.lib_rn1Yxt6.lib_2WawZPB.lib_2p_jTmF.lib_10OTPLG.lib_3Wb397t').textContent,
            price: node.querySelector('.lib_pQJ3qld.lib_2VeBY8x.lib_2WawZPB.lib_65XwjLA').textContent
         };
   
         data.push(info);
      }

      ipcRenderer.send('stock-info', data);
   }
   
   document.addEventListener('DOMContentLoaded', () => {
      // Stocktwit watchlist - target
      switch(window.location.origin) {
         case 'https://stocktwits.com':
            stocktwitWatchlist();
            break;
      }
     
   }, false);
});