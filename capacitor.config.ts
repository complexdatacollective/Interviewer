import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.codaco.NetworkCanvasInterviewer6',
  appName: 'network-canvas-interviewer',
  webDir: 'www',
  server: {
    // androidScheme: 'https',
    "url": "http://192.168.1.210:3000",
    "cleartext": true
  },
  // cordova: {
  //   preferences: {
  //     Orientation: 'landscape',
  //     'target-device': 'tablet',
  //     DisallowOverscroll: 'true',
  //     Fullscreen: 'true',
  //     BackupWebStorage: 'none',
  //     AndroidPersistentFileLocation: 'Internal',
  //     iosPersistentFileLocation: 'Library',
  //     AllowInlineMediaPlayback: 'true',
  //     'android-minSdkVersion': '24',
  //     'android-targetSdkVersion': '31'
  //   }
  // }
};

export default config;
