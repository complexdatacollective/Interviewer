/* eslint-disable import/prefer-default-export */

import { createDeepEqualSelector } from './utils';

export const protocolRegistry = createDeepEqualSelector(
  state => state.protocol.variableRegistry,
  registry => registry,
);

export const protocolForms = createDeepEqualSelector(
  state => state.protocol.forms,
  forms => forms,
);

export const getExternalData = createDeepEqualSelector(
  state => state.protocol.externalData,
  protocolData => protocolData,
);

export const makeGetNodeColor = () => createDeepEqualSelector(
  protocolRegistry,
  (state, props) => props.nodeType,
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].color;
  },
);
