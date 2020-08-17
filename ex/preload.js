// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const isDev = require('electron-is-dev');
const tasklist = require('tasklist');

process.once('loaded', () => {
  window.addEventListener('message', event => {
    //@todo: Add COOP
    if (event.source != window) return
    if (event.data.type == null || event.data.type == undefined || event.data.type != "BG_REQUEST") return
    switch (event.data.name) {
      case 'RunningApps':
          (async () => {
            return await tasklist()
          })().then((apps) => {
            if (isDev) console.log("[Dev] Sending APPS Request...")
            window.postMessage({type: 'NG_RESPONSE', name: 'RunningApps', results: {apps}});
          })
        break
    }
  }, false)
})