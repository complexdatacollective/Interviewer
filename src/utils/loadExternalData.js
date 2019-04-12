/* eslint-disable quotes, quote-props, comma-dangle */
import objectHash from 'object-hash';
import * as csv from 'csvtojson';
import { get, omit } from 'lodash';
import environments from './environments';
import inEnvironment from './Environment';
import { readFile } from './filesystem';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../ducks/modules/network';
import getAssetUrl from './protocol/getAssetUrl';

const withKeys = data =>
  data.map((node) => {
    const uid = objectHash(node);

    return {
      ...node,
      [entityPrimaryKeyProperty]: uid,
    };
  });

/**
 * Converts a CSV file into a Network Canvas node list JSON
 *
 * @param {string} data - the contents of a CSV file
 *
 * See: https://github.com/Keyang/node-csvtojson We may want to introduce buffering
 * to this function to increase performance particularly on cordova.
 *
 */
const CSVToJSONNetworkFormat = (data) => {
  const withTypeAndAttributes = node => ({
    type: node.type,
    [entityAttributesProperty]: {
      ...omit(node, 'type'),
    }
  });

  return csv().fromString(data)
    .then((json) => {
      const nodeList = json.map(entry => withTypeAndAttributes(entry));
      return { nodes: nodeList };
    });
};

const fetchNetwork = inEnvironment(
  (environment) => {
    if (environment === environments.ELECTRON || environment === environments.WEB) {
      return (url, fileType) =>
        fetch(url)
          .then((response) => {
            if (fileType === 'csv') {
              return response.text().then(
                data => CSVToJSONNetworkFormat(data)
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
            return CSVToJSONNetworkFormat(response.toString('utf8'));
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
