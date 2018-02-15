const fs = require('fs');
const path = require('path');
const electron = require('electron');

const userDataPath = (electron.app || electron.remote.app).getPath('userData');

const logPath = path.join(userDataPath, 'network-canvas.log');

module.exports = (...args) =>
  fs.appendFileSync(logPath, `${args.join(' ')}\r\n`);
