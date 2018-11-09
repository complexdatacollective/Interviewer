/* eslint-env jest */
import { ActionsObservable } from 'redux-observable';
import { omit } from 'lodash';
import { actionCreators as dialogActions } from '../dialogs';
import { actionCreators as protocolActions } from '../protocol';
import { actionCreators as serverActions } from '../pairedServer';
import { actionCreators as sessionsActions } from '../sessions';
import { epics as errorsEpic } from '../errors';

//  loadProtocolFailed,
// importProtocolFailed,
// downloadProtocolFailed,
// serverActionTypes.SERVER_PAIRING_FAILED,
// sessionsActionTypes.EXPORT_SESSION_FAILED,


const mockError = new Error('foo');

const errorDialogActionWithoutId = error =>
  omit(
    dialogActions.openDialog({ error, type: 'Error' }),
    'id',
  );

const expectDialogErrorAction = (action, error) => {
  const action$ = ActionsObservable.of(
    action(error),
  );

  const expectedAction = errorDialogActionWithoutId(error);

  return errorsEpic(action$).toPromise().then(
    result =>
      expect(result).toMatchObject(expectedAction),
  );
};

describe('errors', () => {
  describe('epics', () => {
    it(
      'loadProtocolFailed',
      () => expectDialogErrorAction(protocolActions.loadProtocolFailed, mockError),
    );

    it(
      'importProtocolFailed',
      () => expectDialogErrorAction(protocolActions.importProtocolFailed, mockError),
    );

    it(
      'downloadProtocolFailed',
      () => expectDialogErrorAction(protocolActions.downloadProtocolFailed, mockError),
    );

    it(
      'pairingFailed',
      () => expectDialogErrorAction(serverActions.pairingFailed, mockError),
    );

    it(
      'sessionExportFailed',
      () => expectDialogErrorAction(sessionsActions.sessionExportFailed, mockError),
    );
  });
});
