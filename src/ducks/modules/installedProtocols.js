import { omit, findKey } from 'lodash';
import { actionTypes as importProtocolActions } from './importProtocol';
import { actionCreators as dialogActions } from './dialogs';
import deleteProtocol from '../../utils/protocol/deleteProtocol';

const IMPORT_PROTOCOL_COMPLETE = importProtocolActions.IMPORT_PROTOCOL_COMPLETE;
const DELETE_PROTOCOL = 'INSTALLED_PROTOCOLS/DELETE_PROTOCOL';

const initialState = {};

const protocolHasSessions = (state, protocolUID) =>
  new Promise((resolve) => {
    const nonExportedSession = findKey(
      state.sessions,
      session => session.protocolUID === protocolUID && !session.lastExportedAt,
    );

    if (nonExportedSession) {
      resolve(true);
    }

    resolve(false);
  });

const confirmDeleteDialog = {
  type: 'Warning',
  title: 'Are you sure?',
  message: 'Are you sure you want to delete this protocol?',
  confirmLabel: 'Delete protocol',
};

const hasSessionsDialog = {
  type: 'Warning',
  title: 'Existing sessions',
  message: 'This protocol has in-progress sessions that have not yet been exported. Please export or delete these sessions before attempting to delete the protocol.',
  canCancel: false,
};

const deleteProtocolAction = protocolUID =>
  (dispatch, getState) =>
    protocolHasSessions(getState(), protocolUID)
      .then((hasSessions) => {
        if (hasSessions) {
          return dispatch(dialogActions.openDialog(hasSessionsDialog));
        }

        return dispatch(dialogActions.openDialog(confirmDeleteDialog))
          .then((confirmed) => {
            if (!confirmed) { return; }
            dispatch({ type: DELETE_PROTOCOL, protocolUID });
            deleteProtocol(protocolUID);
          });
      });

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DELETE_PROTOCOL:
      return omit(state, [action.protocolUID]);
    case IMPORT_PROTOCOL_COMPLETE: {
      const newProtocol = action.protocolData;

      // If the protocol name (which is the true UID of protocol) already exists, overwrite.
      const existingIndex = findKey(state, protocol => protocol.name === newProtocol.name);

      if (existingIndex) {
        return {
          ...state,
          [existingIndex]: omit(newProtocol, 'uid'),
        };
      }

      return {
        ...state,
        [newProtocol.uid]: omit(newProtocol, 'uid'),
      };
    }
    default:
      return state;
  }
}

const actionTypes = {
  DELETE_PROTOCOL,
};

const actionCreators = {
  deleteProtocol: deleteProtocolAction,
};

export {
  actionCreators,
  actionTypes,
};
