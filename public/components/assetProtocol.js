const path = require('path');
const electron = require('electron');
const fs = require('fs');

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const appPath = (electron.app || electron.remote.app).getAppPath();

// default to asset from factory protocol (with same name) first
const registerProtocol = () => electron.protocol.registerFileProtocol('asset', (request, callback) => {
  const file = request.url.substr(8);
  const decodedPath = decodeURIComponent(file);
  const appFilePath = path.normalize(path.join(appPath, 'protocols', decodedPath));
  const userDataFilePath = path.normalize(path.join(userDataPath, 'protocols', decodedPath));

  // eslint-disable-next-line
    fs.access(appFilePath, fs.constants.R_OK, (err) => {
    const filePath = err ? userDataFilePath : appFilePath;
    callback({ path: filePath });
  });
});

exports.registerProtocol = registerProtocol;
