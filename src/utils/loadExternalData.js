/* eslint-disable quotes, quote-props, comma-dangle */
import objectHash from 'object-hash';
import { get } from 'lodash';
import environments from './environments';
import inEnvironment from './Environment';
import { readFile } from './filesystem';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import getAssetUrl from './protocol/getAssetUrl';

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
      return url =>
        fetch(url)
          .then(response => response.json())
          .then((json) => {
            const nodes = get(json, 'nodes', []);
            return ({ nodes: withKeys(nodes) });
          });
    }

    if (environment === environments.CORDOVA) {
      return url => readFile(url)
        .then(response => JSON.parse(response))
        .then((json) => {
          const nodes = get(json, 'nodes', []);
          return ({ nodes: withKeys(nodes) });
        });
    }

    return Promise.reject('Environment not supported');
  },
);

const parseJSON = (fileContents) => {

};

const parseCSV = (fileContents) => {

};

const fileExtension = fileName => fileName.split('.').pop();

/**
 * Loads network data from assets and appends objectHash uids.
 *
 * @param {string} protocolUID - UID of the protocol
 * @param {string} fileName - Filename of the network assets
 * @returns {object} Network object in format { nodes, edges }
 *
 */
const loadExternalData = (protocolUID, fileName) => {
  const fileType = fileExtension(fileName) === 'csv' ? 'csv' : 'json';

  return getAssetUrl(protocolUID, fileName)
    .then(url => fetchNetwork(url, fileType));
};


export default loadExternalData;
