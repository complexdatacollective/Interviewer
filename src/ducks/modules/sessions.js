import { omit, map, reduce } from 'lodash';
import uuid from 'uuid/v4';
import ApiClient from '../../utils/ApiClient';
import exportSessions from '../../utils/exportSessions';
import { actionCreators as SessionWorkerActions } from './sessionWorkers';
import { actionTypes as installedProtocolsActionTypes } from './installedProtocols';
import networkReducer, { actionTypes as networkActionTypes, actionCreators as networkActions, entityPrimaryKeyProperty } from './network';
import { sessionProperty, remoteProtocolProperty } from '../../utils/network-exporters/src/utils/reservedAttributes';

const ADD_SESSION = 'ADD_SESSION';
const FINISH_SESSION = 'FINISH_SESSION';
const LOAD_SESSION = 'LOAD_SESSION';
const UPDATE_PROMPT = 'UPDATE_PROMPT';
const UPDATE_STAGE = 'UPDATE_STAGE';
const UPDATE_CASE_ID = 'UPDATE_CASE_ID';
const UPDATE_STAGE_STATE = 'UPDATE_STAGE_STATE';
const REMOVE_SESSION = 'REMOVE_SESSION';
const EXPORT_SESSIONS_START = 'EXPORT_SESSIONS_START';
const EXPORT_SESSIONS_RESET = 'EXPORT_SESSIONS_RESET';
const EXPORT_SESSION_FAILED = 'EXPORT_SESSION_FAILED';
const EXPORT_SESSION_SUCCEEDED = 'EXPORT_SESSION_SUCCEEDED';

const initialState = {};

const withTimestamp = session => ({
  ...session,
  updatedAt: Date.now(),
});

const getReducer = network =>
  (state = initialState, action = {}) => {
    switch (action.type) {
      case installedProtocolsActionTypes.DELETE_PROTOCOL:
        return reduce(state, (result, sessionData, sessionId) => {
          if (sessionData.protocolUID !== action.protocolUID) {
            return { ...result, [sessionId]: sessionData };
          }
          return result;
        }, {});
      case networkActionTypes.ADD_NODE:
      case networkActionTypes.BATCH_ADD_NODES:
      case networkActionTypes.REMOVE_NODE:
      case networkActionTypes.REMOVE_NODE_FROM_PROMPT:
      case networkActionTypes.UPDATE_NODE:
      case networkActionTypes.TOGGLE_NODE_ATTRIBUTES:
      case networkActionTypes.ADD_EDGE:
      case networkActionTypes.UPDATE_EDGE:
      case networkActionTypes.TOGGLE_EDGE:
      case networkActionTypes.REMOVE_EDGE:
      case networkActionTypes.UPDATE_EGO:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            network: network(state[action.sessionId].network, action),
          }),
        };
      case ADD_SESSION:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            protocolUID: action.protocolUID,
            promptIndex: 0,
            stageIndex: 0,
            caseId: action.caseId,
            network: network(state.network, action),
            startedAt: Date.now(),
          }),
        };
      case FINISH_SESSION:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            finishedAt: Date.now(),
          }),
        };
      case LOAD_SESSION:
        return state;
      case UPDATE_PROMPT:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            promptIndex: action.promptIndex,
          }),
        };
      case UPDATE_STAGE:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            stageIndex: action.stageIndex,
          }),
        };
      case UPDATE_CASE_ID:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            caseId: action.caseId,
          }),
        };
      case UPDATE_STAGE_STATE: {
        const session = state[action.sessionId];

        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...session,
            stages: {
              ...session.stages,
              [action.stageIndex]: action.state,
            },
          }),
        };
      }
      case REMOVE_SESSION:
        return omit(state, [action.sessionId]);
      case EXPORT_SESSIONS_START: {
        const newObj = {
          ...state,
        };
        map(action.sessionIds, (sessionId) => {
          newObj[sessionId].exportStatus = 'exporting';
        });

        return {
          ...state,
          ...newObj,
        };
      }
      case EXPORT_SESSIONS_RESET: {
        const newObj = {
          ...state,
        };

        map(state, (session, sessionUUID) => {
          newObj[sessionUUID].exportStatus = null;
          newObj[sessionUUID].exportError = null;
        });
        return {
          ...state,
          ...newObj,
        };
      }
      case EXPORT_SESSION_SUCCEEDED:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            lastExportedAt: Date.now(),
            exportStatus: 'finished',
          }),
        };
      case EXPORT_SESSION_FAILED:
        return {
          ...state,
          [action.sessionId]: withTimestamp({
            ...state[action.sessionId],
            exportStatus: 'error',
            exportError: action.error,
          }),
        };
      default:
        return state;
    }
  };

/**
 * This function generates default values for all variables in the variable registry for this node
 * type.
 *
 * @param {object} registryForType - An object containing the variable registry entry for this
 *                                   node type.
 */

const getDefaultAttributesForEntityType = (registryForType = {}) => {
  const defaultAttributesObject = {};

  // Boolean variables are initialised as `false`, and everything else as `null`
  Object.keys(registryForType).forEach((key) => {
    defaultAttributesObject[key] = registryForType[key].type === 'boolean' ? false : null;
  });

  return defaultAttributesObject;
};

/**
 * Take a action (probably a network action, and append the active sessionId
 * to it.
 * @param {object} action redux action object
 */
const withActiveSessionId = action =>
  (dispatch, getState) => {
    const { activeSessionId: sessionId } = getState();

    dispatch({
      ...action,
      sessionId,
    });
  };

/**
 * Add a batch of nodes to the state.
 *
 * @param {Collection} [nodeList] An array of objects representing nodes to add.
 * @param {Object} [attributeData] Attribute data that will be merged with each node
 * @param {String} [type] A node type ID
 *
 * @memberof! NetworkActionCreators
 * TODO: is `type` superfluous as contained by nodes in nodeList?
 */
const batchAddNodes = (nodeList, attributeData, type) =>
  (dispatch, getState) => {
    const { activeSessionId, sessions, installedProtocols } = getState();

    const session = sessions[activeSessionId];
    const activeProtocol = installedProtocols[session.protocolUID];
    const nodeRegistry = activeProtocol.codebook.node;
    const registryForType = nodeRegistry[type].variables;
    const defaultAttributes = getDefaultAttributesForEntityType(registryForType);

    dispatch(
      withActiveSessionId(
        networkActions.batchAddNodes(
          nodeList,
          attributeData,
          defaultAttributes,
        ),
      ),
    );
  };

const addNode = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { activeSessionId, sessions, installedProtocols } = getState();

  const activeProtocol = installedProtocols[sessions[activeSessionId].protocolUID];
  const nodeRegistry = activeProtocol.codebook.node;

  const registryForType = nodeRegistry[modelData.type].variables;

  dispatch({
    type: networkActionTypes.ADD_NODE,
    sessionId: activeSessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const updateNode = (nodeId, newModelData = {}, newAttributeData = {}) => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.UPDATE_NODE,
    sessionId: activeSessionId,
    nodeId,
    newModelData,
    newAttributeData,
  });
};

const toggleNodeAttributes = (uid, attributes) => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.TOGGLE_NODE_ATTRIBUTES,
    sessionId: activeSessionId,
    [entityPrimaryKeyProperty]: uid,
    attributes,
  });
};

const removeNode = uid => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.REMOVE_NODE,
    sessionId: activeSessionId,
    [entityPrimaryKeyProperty]: uid,
  });
};

const removeNodeFromPrompt = (nodeId, promptId, promptAttributes) => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.REMOVE_NODE_FROM_PROMPT,
    sessionId: activeSessionId,
    nodeId,
    promptId,
    promptAttributes,
  });
};

const updateEgo = (modelData = {}, attributeData = {}) => (dispatch, getState) => {
  const { activeSessionId, sessions, installedProtocols } = getState();

  const activeProtocol = installedProtocols[sessions[activeSessionId].protocolUID];
  const egoRegistry = activeProtocol.codebook.ego;

  dispatch({
    type: networkActionTypes.UPDATE_EGO,
    sessionId: activeSessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(egoRegistry.variables),
      ...attributeData,
    },
  });
};

const addEdge = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { activeSessionId, sessions, installedProtocols } = getState();

  const activeProtocol = installedProtocols[sessions[activeSessionId].protocolUID];
  const edgeRegistry = activeProtocol.codebook.edge;

  const registryForType = edgeRegistry[modelData.type].variables;

  dispatch({
    type: networkActionTypes.ADD_EDGE,
    sessionId: activeSessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const updateEdge = (edgeId, newModelData = {}, newAttributeData = {}) => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.UPDATE_EDGE,
    sessionId: activeSessionId,
    edgeId,
    newModelData,
    newAttributeData,
  });
};

const toggleEdge = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { activeSessionId, sessions, installedProtocols } = getState();

  const activeProtocol = installedProtocols[sessions[activeSessionId].protocolUID];
  const edgeRegistry = activeProtocol.codebook.edge;

  const registryForType = edgeRegistry[modelData.type].variables;

  dispatch({
    type: networkActionTypes.TOGGLE_EDGE,
    sessionId: activeSessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const removeEdge = edgeId => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: networkActionTypes.REMOVE_EDGE,
    sessionId: activeSessionId,
    edgeId,
  });
};

const addSession = (caseId, protocolUID) => (dispatch) => {
  const id = uuid();

  dispatch({
    type: ADD_SESSION,
    sessionId: id,
    caseId,
    protocolUID,
  });

  return dispatch(SessionWorkerActions.initializeSessionWorkersThunk(protocolUID))
    .then(() => id);
};

const updateCaseId = caseId => (dispatch, getState) => {
  const { activeSessionId } = getState();

  dispatch({
    type: UPDATE_CASE_ID,
    sessionId: activeSessionId,
    caseId,
  });
};

const loadSession = () => (dispatch) => {
  dispatch({
    type: LOAD_SESSION,
  });
};

const updatePrompt = promptIndex => (dispatch, getState) => {
  const state = getState();
  const sessionId = state.activeSessionId;

  dispatch({
    type: UPDATE_PROMPT,
    sessionId,
    promptIndex,
  });
};

const updateStage = stageIndex => (dispatch, getState) => {
  const state = getState();
  const sessionId = state.activeSessionId;

  dispatch({
    type: UPDATE_STAGE,
    sessionId,
    stageIndex,
  });
};

const withSessionId = action =>
  (dispatch, getState) => {
    const { activeSessionId: sessionId } = getState();

    dispatch({
      ...action,
      sessionId,
    });
  };

const updateStageState = state =>
  (dispatch, getState) => {
    const { activeSessionId, sessions } = getState();
    const stageIndex = sessions[activeSessionId].stageIndex;

    dispatch(withSessionId({
      type: UPDATE_STAGE_STATE,
      stageIndex,
      state,
    }));
  };

function removeSession(id) {
  return {
    type: REMOVE_SESSION,
    sessionId: id,
  };
}

const finishSession = id => ({
  type: FINISH_SESSION,
  sessionId: id,
});

const sessionExportStart = sessionIds => ({
  type: EXPORT_SESSIONS_START,
  sessionIds,
});

const sessionExportReset = () => ({
  type: EXPORT_SESSIONS_RESET,
});

const sessionExportSucceeded = id => ({
  type: EXPORT_SESSION_SUCCEEDED,
  sessionId: id,
});

const sessionExportFailed = (id, error) => ({
  type: EXPORT_SESSION_FAILED,
  error,
  sessionId: id,
});

const bulkFileExportSessions = sessionList => (dispatch, getState) => {
  dispatch(sessionExportStart(
    sessionList.map(session => (session.sessionVariables[sessionProperty])),
  ));

  const { installedProtocols, deviceSettings: {
    exportGraphML,
    exportCSV,
    unifyNetworks,
    useScreenLayoutCoordinates,
    screenLayoutHeight,
    screenLayoutWidth,
  } } = getState();

  const exportOptions = {
    exportGraphML,
    exportCSV,
    globalOptions: {
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  };

  return exportSessions(exportOptions, sessionList, installedProtocols)
    .then(() =>
      sessionList.map(session =>
        dispatch(sessionExportSucceeded(session.sessionVariables[sessionProperty]))))
    .catch(err =>
      sessionList.map(session =>
        dispatch(sessionExportFailed(session.sessionVariables[sessionProperty], err))),
    );
};

const bulkServerExportSessions = sessionList => (dispatch, getState) => {
  const pairedServer = getState().pairedServer;

  if (pairedServer) {
    const client = new ApiClient(pairedServer);
    let results = [];

    // Use reduce to create a promise sequence.
    return client.addTrustedCert().then(() => {
      dispatch(sessionExportStart(
        sessionList.map(session => (session.sessionVariables[sessionProperty])),
      ));

      return sessionList.reduce(
        (previousSession, nextSession) =>
          previousSession
            .then(
              () => client.exportSession(
                nextSession.sessionVariables[remoteProtocolProperty],
                nextSession.sessionUUID[sessionProperty],
                nextSession.sessionData,
              ).then((data) => {
                // return of session export
                dispatch(sessionExportSucceeded(nextSession.sessionUUID));

                results = [...results, {
                  sessionUUID: nextSession.sessionUUID,
                  response: data,
                }];
              }).catch((error) => {
                // session export failed...
                dispatch(sessionExportFailed(nextSession.sessionUUID, error));
                results = [...results, {
                  sessionUUID: nextSession.sessionUUID,
                  response: error,
                }];
              }),
            ), Promise.resolve(),
      );
    }).then(() => results);
  }
  return Promise.reject(new Error('No paired server available'));
};

const actionCreators = {
  addNode,
  batchAddNodes,
  updateNode,
  removeNode,
  removeNodeFromPrompt,
  updateEgo,
  addEdge,
  updateEdge,
  toggleEdge,
  removeEdge,
  toggleNodeAttributes,
  addSession,
  loadSession,
  updatePrompt,
  updateStage,
  updateCaseId,
  updateStageState,
  removeSession,
  finishSession,
  sessionExportStart,
  sessionExportSucceeded,
  sessionExportReset,
  sessionExportFailed,
  bulkServerExportSessions,
  bulkFileExportSessions,
};

const actionTypes = {
  ADD_SESSION,
  FINISH_SESSION,
  LOAD_SESSION,
  UPDATE_PROMPT,
  UPDATE_STAGE,
  UPDATE_CASE_ID,
  UPDATE_STAGE_STATE,
  REMOVE_SESSION,
  EXPORT_SESSION_FAILED,
  EXPORT_SESSIONS_START,
  EXPORT_SESSIONS_RESET,
};

export {
  actionCreators,
  actionTypes,
  getReducer,
};

export default getReducer(networkReducer);
