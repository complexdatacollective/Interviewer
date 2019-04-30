/* eslint-env jest */
import { ActionsObservable } from 'redux-observable';
import { omit } from 'lodash';
import { actionCreators as dialogActions } from '../dialogs';
import { actionCreators as importProtocolActions } from '../importProtocol';
import { actionCreators as serverActions } from '../pairedServer';
import { actionCreators as sessionsActions } from '../sessions';
import { epics as errorsEpic } from '../errors';

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
      'importProtocolFailed',
      () => expectDialogErrorAction(importProtocolActions.importProtocolFailed, mockError),
    );

    it(
      'pairingFailed',
      () => expectDialogErrorAction(serverActions.pairingFailed, mockError),
    );
  });
});
