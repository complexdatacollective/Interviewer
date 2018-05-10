/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../session';

const initialState = 'CREATE_NEW';

describe('session reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  it('should handle SET_SESSION', () => {
    const newState = reducer(initialState, { type: actionTypes.SET_SESSION, sessionId: 'a' });
    expect(newState).toEqual('a');
  });
});

describe('session actionCreators', () => {
  it('should provide a method to set session', () => {
    const expectedAction = { type: actionTypes.SET_SESSION, sessionId: 'a' };
    expect(actionCreators.setSession('a')).toEqual(expectedAction);
  });
});
