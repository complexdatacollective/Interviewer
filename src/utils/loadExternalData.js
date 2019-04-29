/* eslint-disable quotes, quote-props, comma-dangle */
import { get } from 'lodash';
import environments from './environments';
import inEnvironment from './Environment';
import { readFile } from './filesystem';
import getAssetUrl from './protocol/getAssetUrl';
import Worker from './csvDecoder.worker';

/**
 * Converting data from CSV to our network JSON format is expensive, and so happens
 * inside of a worker to keep the app as responsive as possible.
 *
 * This function takes the result of the platform-specific file load operation,
 * and then initialises the conversion worker, before sending it the file contents
 * to decode.
 */
const convertCSVToJsonWithWorker = response => Promise.resolve(response)
  .then(
    data => new Promise((resolve, reject) => {
      const worker = new Worker();
      worker.postMessage(data);
      worker.onerror = (event) => {
        reject(event);
      };
      worker.onmessage = (event) => {
        resolve(event.data);
      };
    })
  );

const fetchNetwork = inEnvironment(
  (environment) => {
    if (environment === environments.ELECTRON || environment === environments.WEB) {
      return (url, fileType) =>
        fetch(url)
          .then((response) => {
            if (fileType === 'csv') {
              return convertCSVToJsonWithWorker(response.text());
            }

            return response.json();
          })
          .then((json) => {
            const nodes = get(json, 'nodes', []);
            return ({ nodes });
          });
    }

    if (environment === environments.CORDOVA) {
      return (url, fileType) => readFile(url)
        .then((response) => {
          if (fileType === 'csv') {
            return convertCSVToJsonWithWorker(response.toString('utf8'));
          }
          return JSON.parse(response);
        })
        .then((json) => {
          const nodes = get(json, 'nodes', []);
          return ({ nodes });
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
