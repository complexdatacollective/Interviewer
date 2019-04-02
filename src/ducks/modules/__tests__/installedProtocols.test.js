/* eslint-env jest */

import reducer from '../installedProtocols';

const initialState = {};

describe('protocols reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  // describe('SET_PROTOCOL', () => {
  //   it('adds a new protocol', () => {
  //     const setProtocolAction = { type: ProtocolActionTypes.SET_PROTOCOL, installedProtocols: { name: 'new' } };
  //     expect(reducer(initialState, setProtocolAction)).toHaveLength(initialState.length + 1);
  //   });

  //   it('does not add an existing protocol', () => {
  //     const setProtocolAction = { type: ProtocolActionTypes.SET_PROTOCOL, installedProtocols: { name: 'new' } };
  //     const newState = reducer(initialState, setProtocolAction);
  //     expect(reducer(newState, setProtocolAction)).toHaveLength(newState.length);
  //   });
  // });
});
