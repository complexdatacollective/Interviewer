const electron = require('electron');
const path = require('path');
const log = require('electron-log');
const fs = require('fs');

const userDataPath = (electron.app || electron.remote.app).getPath('userData')

// Same as for console transport
log.transports.file.level = 'log';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

// Set approximate maximum log size in bytes. When it exceeds,
// the archived log will be saved as the log.old.log file
log.transports.file.maxSize = 5 * 1024 * 1024;

// fs.createWriteStream options, must be set before first logging
// you can find more information at
// https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
log.transports.file.streamConfig = { flags: 'w' };

// set existed file stream
log.transports.file.stream = fs.createWriteStream(path.join(userDataPath, 'debug.log'));

module.exports = log;
