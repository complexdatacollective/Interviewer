import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from './sessions';
import { actionCreators as deviceActions } from './deviceSettings';
import resetProtocolFiles from '../../utils/protocol/resetProtocolFiles';
import { get } from '../../utils/lodash-replacements';

const RESET_STATE = 'RESET_STATE';
const RESET_EDGES_OF_TYPE = 'RESET/EDGES_OF_TYPE';
const RESET_PROPERTY_FOR_ALL_NODES = 'RESET/PROPERTY_FOR_ALL_NODES';

const resetPropertyForAllNodes = (property) => (dispatch, getState) => {
  const { activeSessionId } = getState();
  const {
    sessions: {
      [activeSessionId]: {
        network: { nodes },
        protocolUID,
      },
    },
    installedProtocols: {
      [protocolUID]: {
        codebook: {
          node: nodeRegistry,
        },
      },
    },
  } = getState();

  nodes.forEach((node) => {
    // Node definition may not have any variables
    const registryForType = get(nodeRegistry, [node.type, 'variables'], {});

    if (registryForType[property]) {
      const variableType = registryForType[property].type;
      dispatch(
        sessionsActions.updateNode(
          node[entityPrimaryKeyProperty],
          {},
          {
            [property]: variableType === 'boolean' ? false : null,
          },
        ),
      );
    }
  });
};

const resetEdgesOfType = (edgeType) => (dispatch, getState) => {
  const { activeSessionId } = getState();
  const { sessions: { [activeSessionId]: { network: { edges } } } } = getState();

  edges.forEach((edge) => {
    if (edge.type !== edgeType) {
      dispatch(sessionsActions.removeEdge(edge[entityPrimaryKeyProperty]));
    }
  });
};

const resetAppState = () => (dispatch) => {
  dispatch({ type: RESET_STATE });
  resetProtocolFiles();
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
