/* eslint-disable import/prefer-default-export */

import { createDeepEqualSelector } from './utils';

const protocolReducer = (obj, protocol) => {
  obj[protocol.path] = protocol; // eslint-disable-line no-param-reassign
  return obj;
};

// @return {Object} protocol info, keyed by ID/path
export const protocolsByPath = createDeepEqualSelector(
  state => state.installedProtocols.reduce(protocolReducer, {}),
  protocolData => protocolData,
);
