const config = {
  appId: 'io.zainauto.app',
  appName: 'Zain Automation',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    hostname: 'zainauto.app'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#020617',
      showSpinner: true,
      spinnerColor: '#6366f1'
    }
  }
};

export default config;
