const wd = require('wd');

// Configure the Appium server to listen to localhost:4723
export const remote = wd.remote({
  hostname: 'localhost',
  port: 4723,
}, 'promise');

// Configure the Appium server for Android API level 19 and the app
// we want to test.
export const config = {
  iOS10Hybrid: {
    browserName: '',
    'appium-version': '1.6.5',
    deviceName: 'iPad Air',
    platformName: 'iOS',
    platformVersion: '10.3',
    autoWebview: true,
    app: './platforms/ios/build/emulator/NetworkCanvas.app',
  },
};
