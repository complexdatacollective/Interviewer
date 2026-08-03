import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAP_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'org.codaco.NetworkCanvasInterviewer6',
  appName: 'Network Canvas Interviewer',
  webDir: 'dist-web',
  server: {
    androidScheme: 'https',
    ...(devServerUrl ? { url: devServerUrl, cleartext: true } : {}),
  },
  // contentInset 'never' makes the webview edge-to-edge so the app's own
  // background shows behind iPadOS 26's window controls (no distinct gray
  // titlebar); backgroundColor avoids a white flash before the web content
  // paints. The renderer pads top content via env(safe-area-inset-*).
  ios: { contentInset: 'never', backgroundColor: '#000000' },
  android: { allowMixedContent: Boolean(devServerUrl) },
};

export default config;
