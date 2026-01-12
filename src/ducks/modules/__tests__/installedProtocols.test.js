/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import { createStore, applyMiddleware } from 'redux';
import thunks from 'redux-thunk';
import reducer, { actionCreators, actionTypes } from '../installedProtocols';
import deleteProtocol from '../../../utils/protocol/deleteProtocol';
import { actionCreators as dialogsActions } from '../dialogs';

vi.mock('../dialogs');
vi.mock('../../../utils/protocol/deleteProtocol', () => ({
  default: vi.fn(() => Promise.resolve(true)),
}));

const testMiddleware = (actionListener) => () => (next) => (action) => {
  actionListener(action);
  return next(action);
};

const mockState = {
  installedProtocols: {
    abcd: {
      name: 'Mock Protocol',
    },
  },
};

const getStore = (actionListener, initialState) => (
  createStore(reducer, initialState, applyMiddleware(thunks, testMiddleware(actionListener)))
);

describe('protocols reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual({});
  });

  describe('deleteProtocolAction()', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    const protocolUID = 'abcd';

    it('DELETE_PROTOCOL action should remove item from installedProtocols', () => {
      const action = {
        type: actionTypes.DELETE_PROTOCOL,
        protocolUID,
      };

      const result = reducer(
        {
          [protocolUID]: { uid: protocolUID },
        },
        action,
      );

      expect(result).toEqual({});
    });

    it('deletes protocol when there are no existing sessions', () => {
      const actionListener = vi.fn();

      const store = getStore(actionListener);
      store.dispatch(actionCreators.deleteProtocol(protocolUID));

      const state = store.getState();

      expect(state).toMatchObject({});
    });

    describe('Has existing sessions', () => {
      it('warns user about existing sessions', async () => {
        const actionListener = vi.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(false),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID, exportedAt: Date.now() },
          ],
          ...mockState,
        });
        await store.dispatch(actionCreators.deleteProtocol(protocolUID));

        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(dialogsActions.openDialog.mock.calls).toMatchSnapshot();
        expect(deleteProtocol.mock.calls.length).toBe(0);
      });

      it('warns user about existing sessions, but allows deletion on confirm', async () => {
        const actionListener = vi.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(true),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID, exportedAt: Date.now() },
          ],
          ...mockState,
        });
        await store.dispatch(actionCreators.deleteProtocol(protocolUID));

        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(deleteProtocol.mock.calls.length).toBe(1);
      });
    });

    describe('Has non-exported existing sessions', () => {
      it('warns user about existing sessions', async () => {
        const actionListener = vi.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(false),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID },
          ],
          ...mockState,
        });
        await store.dispatch(actionCreators.deleteProtocol(protocolUID));

        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(dialogsActions.openDialog.mock.calls).toMatchSnapshot();
        expect(deleteProtocol.mock.calls.length).toBe(0);
      });

      it('warns user about existing sessions, but allows deletion on confirm', async () => {
        const actionListener = vi.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(true),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID },
          ],
          ...mockState,
        });
        await store.dispatch(actionCreators.deleteProtocol(protocolUID));

        await new Promise((resolve) => { setTimeout(resolve, 0); });
        expect(deleteProtocol.mock.calls.length).toBe(1);
      });
    });
  });
});
