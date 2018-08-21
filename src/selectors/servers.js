import { createDeepEqualSelector } from './utils';

const pairedServers = state => state.servers.paired;

// Servers are considered equal if they use the same URL
const getPairedServer = createDeepEqualSelector(
  pairedServers,
  // TODO: shape will change to storing only a single server; pick first for now
  servers => servers[0] || null,
);

export {
  getPairedServer, // eslint-disable-line import/prefer-default-export
};
