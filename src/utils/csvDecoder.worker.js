/* eslint-disable no-restricted-globals */
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

const csv = require('../../node_modules/csvtojson/browser/browser.js');

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
self.addEventListener(
  'message',
  (event) => {
    CSVToJSONNetworkFormat(event.data)
      .then((network) => {
        self.postMessage(network);
      });
  },
);
