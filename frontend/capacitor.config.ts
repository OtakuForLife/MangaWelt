/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cc.lskl.mangawelt',
  appName: 'MangaWelt',
  webDir: 'dist',
  server: {
    // Allow cleartext traffic for API calls
    cleartext: true,
    // Use http scheme to allow mixed content during development
    androidScheme: 'http'
  },
  plugins: {
    EdgeToEdge: {
      // Use white background for light theme
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
