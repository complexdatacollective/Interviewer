import objectHash from 'object-hash';

import { actionTypes } from './protocol';
import { NodePK } from './network';

const initialState = null;

const dataWithNodePKs = (externalData) => {
  const cleanedData = {};
  if (!externalData) {
    return externalData;
  }
  Object.entries(externalData).forEach(([key, val]) => {
    if (val.nodes) {
      cleanedData[key] = {
        ...val,
        nodes: val.nodes.map((node) => {
          // Allow `0` as an ID; may be numeric
          if (!node[NodePK] && node[NodePK] !== 0) {
            return { ...node, [NodePK]: objectHash(node) };
          }
          return node;
        }),
      };
    } else {
      cleanedData[key] = val;
    }
  });
  return cleanedData;
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case actionTypes.SET_PROTOCOL:
      return {
        ...dataWithNodePKs(action.protocol.externalData) || {},
      };
    default:
      return state;
  }
}
