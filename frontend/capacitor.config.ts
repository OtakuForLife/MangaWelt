import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cc.lskl.mangawelt',
  appName: 'MangaWelt',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      importance: "high", // Android: Set notification importance to high
      foregroundPresentation: true, // iOS: Show notification when app is in foreground
    },
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
