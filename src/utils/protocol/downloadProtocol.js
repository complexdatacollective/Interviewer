/* eslint-disable global-require */
/* global window, FileTransfer */

import environments from '../environments';
import inEnvironment from '../Environment';
import { writeStream } from '../filesystem';

const getProtocolNameFromUri = uri => new URL(uri).pathname.split('/').pop();

const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request');
    const path = require('path');
    const electron = require('electron');

    return (uri) => {
      const protocolName = getProtocolNameFromUri(uri);
      const tempPath = (electron.app || electron.remote.app).getPath('temp');
      const destination = path.join(tempPath, protocolName);

      return writeStream(destination, request(uri));
    };
  }

  if (environment === environments.CORDOVA) {
    return (uri) => {
      const protocolName = getProtocolNameFromUri(uri);
      const destination = `cdvfile://localhost/temporary/${protocolName}`;

      return new Promise((resolve, reject) => {
        const fileTransfer = new FileTransfer();
        fileTransfer.download(encodeURI(uri), destination, () => resolve(destination), reject);
      });
    };
  }

  throw new Error(`downloadProtocol() not available on platform ${environment}`);
});

// const importRemoteProtocol = inEnvironment((environment) => {
//   if (environment !== environments.WEB) {
//     return uri =>
//       downloadProtocol(uri)
//         .then(importProtocol);
//   }

//   throw new Error(`importRemoteProtocol() not available on platform ${environment}`);
// });

export default downloadProtocol;
