import objectHash from 'object-hash';

import { actionTypes } from './protocol';
import { NodePK } from './network';

const initialState = null;

/**
 * @private
 * All external data nodes must be identified in the app with a primary key (== NodePK).
 *
 * For each object in an external data set's collection of nodes:
 * - If the object is missing a PK, we assign it one (to the [NodePK] prop)
 *   + The assigned PK is equal to the hash of the object contents, so is consistent across imports
 *   + A PK is missing if it is falsy, and not equal to 0. (`0` is allowed as an identifier.)
 */
const dataWithNodePKs = (externalData) => {
  const cleanedData = {};
  if (!externalData) {
    return externalData;
  }
  Object.entries(externalData).forEach(([key, val]) => {
    if (val.nodes) {
      cleanedData[key] = {
        ...val,
        nodes: val.nodes.map(node => ({ ...node, [NodePK]: objectHash(node) })),
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
