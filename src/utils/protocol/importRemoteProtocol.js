/* eslint-disable */
/* eslint-disable global-require */
/* global window, FileTransfer */

import environments from '../environments';
import inEnvironment from '../Environment';
import importer from '../importer';
import { writeStream } from '../filesystem';

const getProtocolNameFromUri = uri => new URL(uri).pathname.split('/').pop();

const fetchRemoteProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request');
    const path = require('path');
    const electron = require('electron');

    return (uri) => {
      const protocolName = getProtocolNameFromUri(uri);
      const tempPath = (electron.app || electron.remote.app).getPath('temp');
      const destination = path.join(tempPath, protocolName);

      console.log('fetch', uri, protocolName, destination);

      return writeStream(destination, request(uri));
    };
  }

  if (environment === environments.CORDOVA) {
    return (uri) => {
      const protocolName = getProtocolNameFromUri(uri);
      const destination = `cdvfile://localhost/temporary/${protocolName}`;

      console.log('fetch', uri, protocolName, destination);

      return new Promise((resolve, reject) => {
        console.log('file transfer');
        const fileTransfer = new FileTransfer();
        fileTransfer.download(encodeURI(uri), destination, () => resolve(destination), reject);
      });
    };
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

const importRemoteProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return (uri) => {
      console.log('importRemote', uri);

      return fetchRemoteProtocol(uri)
        .then(importer)
        .then(console.log)
        .catch(console.log);
    }
  }

  if (environment === environments.CORDOVA) {
    return (uri) => {
      console.log('importRemote', uri);

      return fetchRemoteProtocol(uri)
        .then(importer)
        .then(console.log)
        .catch(console.log);
    }
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

window.fetchRemoteProtocol = fetchRemoteProtocol;
window.importRemoteProtocol = importRemoteProtocol;

export default importRemoteProtocol;
