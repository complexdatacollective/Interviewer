/* eslint-env jest */

import { createStore, applyMiddleware } from 'redux';
import thunks from 'redux-thunk';
import reducer, { actionCreators } from '../dialogs';

describe('dialogs', () => {
  it('initialState', () => {
    expect(
      reducer(),
    ).toEqual({
      dialogs: [],
    });
  });

  describe('async actions', () => {
    let store;

    beforeEach(() => {
      store = createStore(reducer, undefined, applyMiddleware(thunks));
    });

    it('OPEN and CLOSE_DIALOG', () => {
      const dialog = { foo: 'bar' };

      store.dispatch(actionCreators.openDialog(dialog));

      const state = store.getState();

      expect(
        store.getState(),
      ).toMatchObject({
        dialogs: [
          { ...dialog },
        ],
      });

      store.dispatch(actionCreators.closeDialog(state.dialogs[0].id));

      expect(
        store.getState(),
      ).toMatchObject({
        dialogs: [],
      });
    });
  });
});
