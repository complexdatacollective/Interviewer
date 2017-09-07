
// test01.js
// Raw node.js code to connect to and configure the Appium server

// Pull in the Appium node.js client library
var wd = require("wd");

// Configure the Appium server to listen to localhost:4723
var appDriver = wd.remote({
  hostname: 'localhost',
  port: 4723,
});

// Configure the Appium server for Android API level 19 and the app
// we want to test.
var config = {};

config.android19Hybrid = {
    deviceName: 'iPad Air',
    platformName:'iOS',
    platformVersion: '10.3',
    autoWebview: true,
    app:'./platforms/ios/build/emulator/NetworkCanvas.app'
};

// This launches the app on the device, making it ready for UI interactions.
appDriver.init(config.android19Hybrid);

// Because there's no more code here to drive the app, Appium will end the session
// after a default of 60 seconds. You can change this using the newCommandTimeout capability.
