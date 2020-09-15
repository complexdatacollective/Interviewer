/* eslint-disable import/prefer-default-export */

import { combineEpics } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { actionCreators as dialogActions } from './dialogs';
import { actionTypes as exportActionTypes } from './exportProcess';
import { actionTypes as serverActionTypes } from './pairedServer';

const errorActions = [
  // importProtocolActionTypes.IMPORT_PROTOCOL_FAILED,
  serverActionTypes.SERVER_PAIRING_FAILED,
  exportActionTypes.SESSION_EXPORT_FATAL_ERROR,
];

const errorsEpic = action$ => action$.pipe(
  filter(action => errorActions.includes(action.type)),
  map(action => dialogActions.openDialog({ type: 'Error', error: action.error })),
);

const epics = combineEpics(
  errorsEpic,
);

export {
  epics,
};
