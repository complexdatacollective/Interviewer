/* eslint-env jest */
import { createEpicMiddleware } from 'redux-observable';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { actionTypes as dialogActionTypes } from '../dialogs';
import { actionCreators as installedProtocolActions, actionTypes as installedProtocolActionTypes } from '../installedProtocols';
import { actionCreators as serverActions, actionTypes as serverActionTypes } from '../pairedServer';
import { epics as errorsEpic } from '../errors';

const mockError = new Error('foo');

const testMiddleware = actionListener =>
  () =>
    next =>
      (action) => {
        actionListener(action);
        return next(action);
      };

const getStore = actionListener =>
  createStore(
    () => {},
    undefined,
    applyMiddleware(
      thunk,
      createEpicMiddleware(errorsEpic),
      testMiddleware(actionListener),
    ),
  );

describe('errors', () => {
  describe('epics', () => {
    it('importProtocolFailed', (done) => {
      const actionListener = jest.fn()
        .mockImplementationOnce(() => {
          expect(actionListener).lastCalledWith(
            expect.objectContaining({
              error: mockError,
              type: installedProtocolActionTypes.IMPORT_PROTOCOL_FAILED,
            }),
          );
        })
        .mockImplementationOnce(() => {
          expect(actionListener).lastCalledWith(
            expect.objectContaining({
              type: dialogActionTypes.OPEN_DIALOG,
              dialog: expect.objectContaining({
                error: mockError,
              }),
            }),
          );

          done();
        });

      const store = getStore(actionListener);
      store.dispatch(installedProtocolActions.importProtocolFailed(mockError));
    });

    it('pairingFailed', (done) => {
      const actionListener = jest.fn()
        .mockImplementationOnce(() => {
          expect(actionListener).lastCalledWith(
            expect.objectContaining({
              error: mockError,
              type: serverActionTypes.SERVER_PAIRING_FAILED,
            }),
          );
        })
        .mockImplementationOnce(() => {
          expect(actionListener).lastCalledWith(
            expect.objectContaining({
              type: dialogActionTypes.OPEN_DIALOG,
              dialog: expect.objectContaining({
                error: mockError,
              }),
            }),
          );

          done();
        });
      const store = getStore(actionListener);

      store.dispatch(serverActions.pairingFailed(mockError));
    });
  });
});
