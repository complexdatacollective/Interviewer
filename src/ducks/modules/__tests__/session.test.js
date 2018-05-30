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

  it('should handle END_SESSION', () => {
    const newState = reducer(initialState, { type: actionTypes.SET_SESSION, sessionId: 'a' });
    expect(reducer(newState, { type: actionTypes.END_SESSION })).toEqual(initialState);
  });
});

describe('session actionCreators', () => {
  it('should provide a method to set session', () => {
    const expectedAction = { type: actionTypes.SET_SESSION, sessionId: 'a' };
    expect(actionCreators.setSession('a')).toEqual(expectedAction);
  });

  it('should provide a method to end the session', () => {
    expect(actionCreators.endSession()).toEqual({ type: actionTypes.END_SESSION });
  });
});
