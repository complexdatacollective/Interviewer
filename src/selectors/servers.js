import { memoize } from 'lodash';

import { createDeepEqualSelector } from './utils';

const pairedServers = state => state.servers.paired;

// Servers are considered equal if they use the same URL
const getPairedServerFactory = createDeepEqualSelector(
  pairedServers,
  servers => memoize(apiUrl => servers.find(s => s.apiUrl === apiUrl) || null),
);

export {
  getPairedServerFactory, // eslint-disable-line import/prefer-default-export
};
