// Routes
const windowRoutes = {
   blank: {
      url: 'blank',
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
      backgroundColor: '#000000000',
      maximize: true,
      blur: true,
      transparent: true,
      saveWindowState: false,
   },

   spotlightWindowOptions: {
      backgroundColor: '#000000000',
      maximize: true,
      blur: true,
      transparent: true,
      saveWindowState: true,
   },

   webbarWindowOptions: {
      backgroundColor: '#000000000',
      maximize: false,
      blur: false,
      transparent: true,
      saveWindowState: false,
   },

   childWindowOptions: {
      backgroundColor: '#ffffff',
      maximize: true,
      blur: false,
      transparent: true,
      saveWindowState: true,
   }
}

module.exports = {
   routes: windowRoutes,
   windowOptions: windowOptions
}