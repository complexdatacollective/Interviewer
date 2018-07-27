import objectHash from 'object-hash';

import { actionTypes } from './protocol';
import { NodePK } from './network';

const initialState = null;

// Name of the property a protocol uses to define a PK field on external data
// Example:
//   "schoolPupils": { "nodesPrimaryKey": "studentId", "nodes": [...] }
const customPKProp = 'nodesPrimaryKey';

/**
 * @private
 * All external data nodes must be identified in the app with a primary key (== NodePK).
 * Each external data source may define its own primary key (in protocol.json).
 * This function makes no restrictions on the data type of custom primary keys.
 *
 * For each object in an external data set's collection of nodes:
 * - If the object is missing a PK, we assign it one (to the [NodePK] prop)
 *   + The assigned PK is equal to the hash of the object contents, so is consistent across imports
 *   + A PK is missing if it is falsy, and not equal to 0. (`0` is allowed as an identifier.)
 * - If the object has a PK, but uses a custom prop for PK, we copy the PK value to [NodePK]
 */
const dataWithNodePKs = (externalData) => {
  const cleanedData = {};
  if (!externalData) {
    return externalData;
  }
  Object.entries(externalData).forEach(([key, val]) => {
    if (val.nodes) {
      const pkName = val[customPKProp] || NodePK;
      cleanedData[key] = {
        ...val,
        nodes: val.nodes.map((node) => {
          if (!node[pkName] && node[pkName] !== 0) {
            return { ...node, [NodePK]: objectHash(node) };
          } else if (pkName !== NodePK) {
            return { ...node, [NodePK]: node[pkName] };
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
