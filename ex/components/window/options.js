// Routes
const windowRoutes = {
   blank: {
      url: 'public/blank.html',
      icon: ''
   },
   index: {
      url: 'public/index.html',
      icon: 'fingerprint'
   },
   webbar: {
      url: 'public/webbar.html',
      icon: 'cog'
   }
}

// Windows options
const windowOptions = {
   parentWindowOptions: {
      backgroundColor: '#ffffff',
      blur: false,
      transparent: false,
      saveWindowState: false,
   },

   spotlightWindowOptions: {
      backgroundColor: '#000000000',
      blur: true,
      transparent: true,
      saveWindowState: true,
   },

   webbarWindowOptions: {
      backgroundColor: '#000000000',
      blur: true,
      transparent: true,
      saveWindowState: false,
   },

   childWindowOptions: {
      backgroundColor: '#ffffff',
      blur: false,
      transparent: false,
      saveWindowState: true,
   }
}

module.exports = {
   routes: windowRoutes,
   windowOptions: windowOptions
}