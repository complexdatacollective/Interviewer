/* eslint-disable */
/* eslint-disable global-require */
/* global window, FileTransfer */

import environments from '../environments';
import inEnvironment from '../Environment';
import importer from '../importer';

const getProtocolName = uri => new URL(uri).pathname.split('/').pop();

const fetchRemoteProtocol = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    return (uri) => {
      const protocolName = getProtocolName(uri);
      const destination = `cdvfile://localhost/temporary/${protocolName}`;

      console.log('fetch', uri, protocolName, destination);

      return new Promise((resolve, reject) => {
        console.log('file transfer');
        const fileTransfer = new FileTransfer();
        // resolves with fileEntry
        fileTransfer.download(encodeURI(uri), destination, resolve, reject);
      });
    };
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

const importRemoteProtocol = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    return (uri) => {
      console.log('importRemote', uri);

      return fetchRemoteProtocol(uri)
        .then((fileEntry) => {
          console.log('fetched, importing', fileEntry, fileEntry.fullPath);
          return importer(`cdvfile://localhost/temporary${fileEntry.fullPath}`);
        })
        .then(console.log)
        .catch(console.log);
    }
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

window.fetchRemoteProtocol = fetchRemoteProtocol;
window.importRemoteProtocol = importRemoteProtocol;

export default importRemoteProtocol;
