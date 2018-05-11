import { omit } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';

const RESET_EDGES_OF_TYPE = 'RESET/EDGES_OF_TYPE';
const RESET_PROPERTY_FOR_ALL_NODES = 'RESET/PROPERTY_FOR_ALL_NODES';

const resetPropertyForAllNodes = property =>
  (dispatch, getState) => {
    const { session } = getState();
    const { sessions: { [session]: { network: { nodes } } } } = getState();

    nodes.forEach(node => dispatch(
      sessionsActions.updateNode(session, omit(node, property), true)));
  };

export const resetEdgesOfType = edgeType =>
  (dispatch, getState) => {
    const { session } = getState();
    const { sessions: { [session]: { network: { edges } } } } = getState();

    edges.forEach((edge) => {
      if (edge.type !== edgeType) {
        dispatch(sessionsActions.removeEdge(session, edge));
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
