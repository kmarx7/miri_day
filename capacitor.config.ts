/// <reference types="@capacitor/app" />
/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mirikkok.app',
  appName: '미리꼭',
  webDir: 'dist',
  backgroundColor: '#F7F7F8',
  loggingBehavior: 'debug',
  android: {
    backgroundColor: '#F7F7F8',
    allowMixedContent: false,
    buildOptions: {
      releaseType: 'AAB',
    },
  },
  plugins: {
    App: {
      disableBackButtonHandler: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_mirikkok',
      iconColor: '#171717',
    },
  },
}

export default config
