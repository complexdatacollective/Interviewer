const path = require('path');
const electron = require('electron');
const fs = require('fs');

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const appPath = (electron.app || electron.remote.app).getAppPath();

// default to asset from from factory protocol (with same name) first
const registerAssetsProtocol = () =>
  electron.protocol.registerFileProtocol('asset', (request, callback) => {
    const file = request.url.substr(8);

    const appFilePath = path.normalize(path.join(appPath, 'protocols', file));
    const userDataFilePath = path.normalize(path.join(userDataPath, 'protocols', file));

    // eslint-disable-next-line
    fs.access(appFilePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      const filePath = err ? userDataFilePath : appFilePath;

      callback({ path: filePath });
    });
  }, (error) => {
    if (error) {
      console.error('Failed to register protocol');
    }
  });

exports.registerAssetsProtocol = registerAssetsProtocol;
