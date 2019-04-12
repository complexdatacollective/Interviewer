/* eslint-disable quotes, quote-props, comma-dangle */
import objectHash from 'object-hash';
import { get } from 'lodash';
import environments from './environments';
import inEnvironment from './Environment';
import { readFile } from './filesystem';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import getAssetUrl from './protocol/getAssetUrl';
import Worker from './csvDecoder.worker';

const withKeys = data =>
  data.map((node) => {
    const uid = objectHash(node);

    return {
      ...node,
      [entityPrimaryKeyProperty]: uid,
    };
  });

const fetchNetwork = inEnvironment(
  (environment) => {
    if (environment === environments.ELECTRON || environment === environments.WEB) {
      return (url, fileType) =>
        fetch(url)
          .then((response) => {
            if (fileType === 'csv') {
              const worker = new Worker();
              return response.text()
                .then(
                  data => new Promise((resolve, reject) => {
                    worker.postMessage(data);
                    worker.onerror = (event) => {
                      reject(event);
                    };
                    worker.onmessage = (event) => {
                      resolve(event.data);
                    };
                  })
                );
            }

            return response.json();
          })
          .then((json) => {
            const nodes = get(json, 'nodes', []);
            return ({ nodes: withKeys(nodes) });
          });
    }

    if (environment === environments.CORDOVA) {
      return (url, fileType) => readFile(url)
        .then((response) => {
          if (fileType === 'csv') {
            const worker = new Worker();

            return new Promise((resolve, reject) => {
              worker.postMessage(response.toString('utf8'));
              worker.onerror = (event) => {
                reject(event);
              };
              worker.onmessage = (event) => {
                resolve(event.data);
              };
            });
          }
          return JSON.parse(response);
        })
        .then((json) => {
          const nodes = get(json, 'nodes', []);
          return ({ nodes: withKeys(nodes) });
        });
    }

    return Promise.reject('Environment not supported');
  },
);

const fileExtension = fileName => fileName.split('.').pop();

/**
 * Loads network data from assets and appends objectHash uids.
 *
 * @param {string} protocolUID - UID of the protocol
 * @param {string} fileName - Filename of the network assets
 * @returns {object} Network object in format { nodes, edges }
 *
 */
const loadExternalData = (protocolUID, fileName, type) => {
  const fileType = fileExtension(fileName) === 'csv' ? 'csv' : 'json';

  switch (type) {
    case 'network':
      return getAssetUrl(protocolUID, fileName)
        .then(url => fetchNetwork(url, fileType));
    default:
      return new Error('You must specify an external data type.');
  }
};

export default loadExternalData;
