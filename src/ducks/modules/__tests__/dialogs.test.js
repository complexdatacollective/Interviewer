/* eslint-env jest */

import { compose } from 'recompose';
import reducer, { actionCreators } from '../dialogs';

describe('dialogs', () => {
  it('initialState', () => {
    expect(
      reducer(),
    ).toEqual({
      dialogs: [],
    });
  });

  it('OPEN_DIALOG', () => {
    const dialog = { foo: 'bar' };
    const openAction = actionCreators.openDialog(dialog);

    expect(
      reducer(undefined, openAction),
    ).toEqual({
      dialogs: [
        { ...dialog, id: openAction.id },
      ],
    });
  });

  it('CLOSE_DIALOG', () => {
    const openAction = actionCreators.openDialog({ foo: 'bar' });
    const closeAction = actionCreators.closeDialog(openAction.id);

    expect(
      compose(
        state => reducer(state, closeAction),
        state => reducer(state, openAction),
      )(reducer()),
    ).toEqual({
      dialogs: [],
    });
  });
});
