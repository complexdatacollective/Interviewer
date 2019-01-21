/* eslint-disable quotes, quote-props, comma-dangle */
import objectHash from 'object-hash';
import { get } from 'lodash';
import environments from './environments';
import inEnvironment from './Environment';
import { readFile } from './filesystem';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
import getAssetUrl from './protocol/getAssetUrl';
import getFactoryProtocolPath from './protocol/factoryProtocolPath';

const withKeys = data =>
  data.map((node) => {
    const uid = objectHash(node);

    return {
      ...node,
      [nodePrimaryKeyProperty]: uid,
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
      return (url, { fileName, protocolType, protocolName }) => {
        if (protocolType === 'factory') {
          return readFile(
            getFactoryProtocolPath(protocolName, `assets/${fileName}`)
          )
            .then(data => JSON.parse(data))
            .then((json) => {
              const nodes = get(json, 'nodes', []);
              return ({ nodes: withKeys(nodes) });
            });
        }

        return readFile(url)
          .then(response => JSON.parse(response))
          .then((json) => {
            const nodes = get(json, 'nodes', []);
            return ({ nodes: withKeys(nodes) });
          });
      };
    }

    return Promise.reject('Environment not supported');
  },
);

/**
 * Loads network data from assets and appends objectHash uids.
 *
 * @param {string} protocolName - Filename of the protocol
 * @param {string} fileName - Filename of the network assets
 * @returns {object} Network object in format { nodes, edges }
 *
 */
const loadExternalData = (protocolName, fileName, protocolType) =>
  getAssetUrl(protocolName, fileName, protocolType)
    .then(url => fetchNetwork(url, { fileName, protocolType, protocolName }));

export default loadExternalData;
