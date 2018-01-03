import { omit } from 'lodash';
import { actionCreators as networkActions } from './network';

const RESET_EDGES_OF_TYPE = 'RESET/EDGES_OF_TYPE';
const RESET_PROPERTY_FOR_ALL_NODES = 'RESET/PROPERTY_FOR_ALL_NODES';

const resetPropertyForAllNodes = property =>
  (dispatch, getState) => {
    const { network: { nodes } } = getState();

    nodes.forEach(node => dispatch(networkActions.updateNode(omit(node, property), true)));
  };

export const resetEdgesOfType = edgeType =>
  (dispatch, getState) => {
    const { network: { edges } } = getState();

    edges.forEach((edge) => {
      if (edge.type !== edgeType) {
        dispatch(networkActions.removeEdge(edge));
      }
    });
  };

const actionCreators = {
  resetEdgesOfType,
  resetPropertyForAllNodes,
};

const actionTypes = {
  RESET_EDGES_OF_TYPE,
  RESET_PROPERTY_FOR_ALL_NODES,
};

export {
  actionCreators,
  actionTypes,
};
