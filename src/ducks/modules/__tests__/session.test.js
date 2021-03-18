/* eslint-env jest */

import reducer, { actionTypes } from '../session';
import { actionTypes as installedProtocolsActionTypes } from '../installedProtocols';

const initialState = null;

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

  it('should handle DELETE_PROTOCOL', () => {
    const newState = reducer('a',
      {
        type: installedProtocolsActionTypes.DELETE_PROTOCOL,
      });

    expect(newState).toEqual(initialState);
  });
});
