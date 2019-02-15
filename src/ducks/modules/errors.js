/* eslint-disable import/prefer-default-export */

import { combineEpics } from 'redux-observable';
import { actionCreators as dialogActions } from './dialogs';
import { actionTypes as errorActionTypes } from './importProtocol';
import { actionTypes as serverActionTypes } from './pairedServer';
import { actionTypes as sessionsActionTypes } from './sessions';

const errorActions = [
  errorActionTypes.DOWNLOAD_PROTOCOL_FAILED,
  errorActionTypes.IMPORT_PROTOCOL_FAILED,
  errorActionTypes.LOAD_PROTOCOL_FAILED,
  serverActionTypes.SERVER_PAIRING_FAILED,
  sessionsActionTypes.EXPORT_SESSION_FAILED,
];

const errorsEpic = action$ =>
  action$
    .filter(action => errorActions.includes(action.type))
    .map(action => dialogActions.openDialog({ type: 'Error', error: action.error }));

const epics = combineEpics(
  errorsEpic,
);

export {
  epics,
};
