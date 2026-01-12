/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

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

  describe('openDialog', () => {
    let store;
    const getDialog = () => ({
      foo: 'bar',
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
    });

    beforeEach(() => {
      store = createStore(reducer, undefined, applyMiddleware(thunks));
    });

    it('Returns a promise', () => {
      const dialog = getDialog();

      expect.assertions(1);

      expect(store.dispatch(actionCreators.openDialog(dialog))).toBeInstanceOf(Promise);
    });

    it('Promise resolves to `false` when onCancel is called', () => {
      const dialog = getDialog();

      expect.assertions(1);

      const subject = expect(store.dispatch(actionCreators.openDialog(dialog)))
        .resolves.toBe(false);

      const state = store.getState();
      state.dialogs[0].onCancel();

      return subject;
    });

    it('Promise resolves to `true` when onConfirm is called', () => {
      const dialog = getDialog();

      expect.assertions(1);

      const subject = expect(store.dispatch(actionCreators.openDialog(dialog)))
        .resolves.toBe(true);

      const state = store.getState();
      state.dialogs[0].onConfirm();

      return subject;
    });
  });
});
