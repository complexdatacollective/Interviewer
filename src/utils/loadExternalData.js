/* eslint-disable quotes, quote-props, comma-dangle */
import objectHash from 'object-hash';
import { get } from 'lodash';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
import getAssetUrl from './protocol/assetUrl';

const withKeys = data =>
  data.map((node) => {
    const uid = objectHash(node);

    return {
      ...node,
      [nodePrimaryKeyProperty]: uid,
    };
  });

const fetchNetwork = (url, options) =>
  fetch(url, options)
    .then(response => response.json())
    .then((json) => {
      const nodes = get(json, 'nodes', []);
      return ({ nodes: withKeys(nodes) });
    });

/**
 * Loads network data from assets and appends objectHash uids.
 *
 * @param {string} protocolName - Filename of the protocol
 * @param {string} fileName - Filename of the network assets
 * @returns {object} Network object in format { nodes, edges }
 *
 */
const loadExternalData = (protocolName, fileName, protocolType) => {
  const abortController = new AbortController();
  const signal = abortController.signal;

  return getAssetUrl(protocolName, `${fileName}.json`, protocolType)
    .then(url =>
      ({
        request: fetchNetwork(url, { signal }),
        abortController,
      })
    );
};

export default loadExternalData;
