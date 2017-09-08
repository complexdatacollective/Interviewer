
// test01.js
// Raw node.js code to connect to and configure the Appium server

// Pull in the Appium node.js client library
const wd = require('wd');

// Configure the Appium server to listen to localhost:4723
const appDriver = wd.remote({
  hostname: 'localhost',
  port: 4723,
}, 'promiseChain');

// Configure the Appium server for Android API level 19 and the app
// we want to test.
const config = {
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

appDriver.init(config.iOS10Hybrid)
  .sleep(3000)
  .elementById('demo')
  .click()
  .sleep(3000)
  .quit();
