const electron = require('electron');
const fs = require('fs');

const registerProtocolProtocol = () =>
  electron.protocol.registerFileProtocol('protocol', (request, callback) => {
    const filePath = request.url.substr(10);

    // eslint-disable-next-line
    fs.access(filePath, fs.constants.R_OK, (error) => {
      if (error) { console.log(error); }
      console.log(filePath);
      callback({ path: filePath });
    });
  }, (error) => {
    if (error) {
      console.error('Failed to register protocol');
    }
  });

exports.registerProtocolProtocol = registerProtocolProtocol;
