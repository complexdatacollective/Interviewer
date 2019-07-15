/* eslint-env jest */
import { createEpicMiddleware } from 'redux-observable';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { actionTypes as dialogActionTypes } from '../dialogs';
import { actionCreators as importProtocolActions } from '../importProtocol';
import { actionCreators as serverActions } from '../pairedServer';
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
    it('importProtocolFailed', () => {
      const actionListener = jest.fn();
      const store = getStore(actionListener);

      store.dispatch(importProtocolActions.importProtocolFailed(mockError));

      setImmediate(() => {
        expect(actionListener).lastCalledWith(
          expect.objectContaining({
            type: dialogActionTypes.OPEN_DIALOG,
            dialog: expect.objectContaining({
              error: mockError,
            }),
          }),
        );
      });
    });

    it('pairingFailed', () => {
      const actionListener = jest.fn();
      const store = getStore(actionListener);

      store.dispatch(serverActions.pairingFailed(mockError));

      setImmediate(() => {
        expect(actionListener).lastCalledWith(
          expect.objectContaining({
            type: dialogActionTypes.OPEN_DIALOG,
            dialog: expect.objectContaining({
              error: mockError,
            }),
          }),
        );
      });
    });
  });
});
