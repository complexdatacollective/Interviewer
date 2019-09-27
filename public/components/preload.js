window.os = require('os');
window.electron = require('electron');
window.events = require('events');
window.mdns = require('mdns');
window.rimraf = require('rimraf');
window.fs = require('fs');
window.path = require('path');
window.requestPromiseNative = require('request-promise-native');

if (process.env.NODE_ENV === 'test') {
  window.electronRequire = require;
}
