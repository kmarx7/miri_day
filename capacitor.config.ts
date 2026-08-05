/// <reference types="@capacitor/app" />

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
  },
}

export default config
