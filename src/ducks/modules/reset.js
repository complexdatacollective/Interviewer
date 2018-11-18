import { omit } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';
import { nodeAttributesProperty } from './network';
import { actionCreators as deviceActions } from './deviceSettings';

const RESET_STATE = 'RESET_STATE';
const RESET_EDGES_OF_TYPE = 'RESET/EDGES_OF_TYPE';
const RESET_PROPERTY_FOR_ALL_NODES = 'RESET/PROPERTY_FOR_ALL_NODES';

const resetPropertyForAllNodes = property =>
  (dispatch, getState) => {
    const { session } = getState();
    const { sessions: { [session]: { network: { nodes } } } } = getState();

    nodes.forEach(node => dispatch(
      sessionsActions.updateNode(omit(node, `${nodeAttributesProperty}.${property}`))));
  };

const resetEdgesOfType = edgeType =>
  (dispatch, getState) => {
    const { session } = getState();
    const { sessions: { [session]: { network: { edges } } } } = getState();

    edges.forEach((edge) => {
      if (edge.type !== edgeType) {
        dispatch(sessionsActions.removeEdge(edge));
      }
    });
  };

const resetAppState = () => (dispatch) => {
  dispatch({ type: RESET_STATE });
  // Dispatch deviceReady to re-populate any device defaults.
  // On Cordova, reset is guaranteed to happen after 'deviceready';
  // on other platforms, it's safe to call at any time (even after page load).
  dispatch(deviceActions.deviceReady());
};

const actionCreators = {
  resetAppState,
  resetEdgesOfType,
  resetPropertyForAllNodes,
};

const actionTypes = {
  RESET_STATE,
  RESET_EDGES_OF_TYPE,
  RESET_PROPERTY_FOR_ALL_NODES,
};

export {
  actionCreators,
  actionTypes,
};
