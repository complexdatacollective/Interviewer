import csv from 'csvtojson';
import { entityAttributesProperty } from '@codaco/shared-consts';
/**
 * Converts a CSV file into a Network Canvas node list JSON
 *
 *  @param {string} data - the contents of a CSV file
 *
 * See: https://github.com/Keyang/node-csvtojson We may want to introduce buffering
 * to this function to increase performance particularly on cordova.
 *
 */

const CSVToJSONNetworkFormat = (data) => {
  const withTypeAndAttributes = (node) => ({
    [entityAttributesProperty]: {
      ...node,
    },
  });

  return csv().fromString(data)
    .then((json) => {
      const nodes = json.map((entry) => withTypeAndAttributes(entry));
      return { nodes };
    });
};

// Respond to message from parent thread
// eslint-disable-next-line no-restricted-globals
self.addEventListener(
  'message',
  (event) => {
    CSVToJSONNetworkFormat(event.data)
      .then((network) => {
        // eslint-disable-next-line no-restricted-globals
        self.postMessage(network);
      });
  },
);
