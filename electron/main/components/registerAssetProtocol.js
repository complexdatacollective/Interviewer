const path = require('path');
const { protocol, app } = require('electron');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const appPath = app.getAppPath();

// default to asset from factory protocol (with same name) first
const registerProtocol = () => {
  // Register asset scheme
  protocol.registerSchemesAsPrivileged([{
    scheme: 'asset',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  }]);

  protocol.registerFileProtocol('asset', (request, callback) => {
    const file = request.url.substring(8);
    const decodedPath = decodeURIComponent(file);
    const appFilePath = path.normalize(path.join(appPath, 'protocols', decodedPath));
    const userDataFilePath = path.normalize(path.join(userDataPath, 'protocols', decodedPath));

    fs.access(appFilePath, fs.constants.R_OK, (err) => {
      const filePath = err ? userDataFilePath : appFilePath;
      callback({ path: filePath });
    });
  });
};

exports.registerProtocol = registerProtocol;
