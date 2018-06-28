/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../protocols';
import { actionTypes as ProtocolActionTypes } from '../protocol';

const initialState = [
  {
    name: 'Education Protocol',
    version: '4.0.0',
    description: 'This is the education protocol.',
    type: 'factory',
    path: 'education.netcanvas',
  },
  {
    name: 'Development Protocol',
    version: '4.0.0',
    description: 'This is the development protocol.',
    type: 'factory',
    path: 'development.netcanvas',
  },
];

const testProtocol = {
  name: 'path',
  path: 'path',
  type: 'type',
};

describe('protocols reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  it('should handle ADD_PROTOCOL', () => {
    const newState = reducer(initialState,
      { type: actionTypes.ADD_PROTOCOL, protocol: testProtocol });
    expect(newState).toEqual([...initialState, testProtocol]);
  });

  describe('LOAD_PROTOCOL', () => {
    const makeAction = attrs => ({ ...attrs, type: ProtocolActionTypes.LOAD_PROTOCOL });
    const actionAttrs = { path: 'path', protocolType: 'download' };
    const expectedProtocol = { name: 'path', path: 'path', type: 'download' };

    it('should add a new protocol', () => {
      const state = reducer(initialState, makeAction(actionAttrs));
      expect(state).toContainEqual(expectedProtocol);
    });

    it('should persist remoteId if available', () => {
      const state = reducer(initialState, makeAction({ ...actionAttrs, remoteId: '1' }));
      expect(state).toContainEqual({ ...expectedProtocol, remoteId: '1' });
    });

    it('should not duplicate protocols with matching paths', () => {
      let state = reducer(initialState, makeAction(actionAttrs));
      state = reducer(state, makeAction(actionAttrs));
      expect(state).toHaveLength(initialState.length + 1);
    });

    it('should not duplicate protocols with matching remoteIds', () => {
      let state = reducer(initialState, makeAction({ path: '1', remoteId: '1' }));
      state = reducer(state, makeAction({ path: '2', remoteId: '1' }));
      expect(state).toHaveLength(initialState.length + 1);
    });
  });
});

describe('protocols actionCreators', () => {
  it('should provide a method to add a protocol', () => {
    const expectedAction = { type: actionTypes.ADD_PROTOCOL, protocol: {} };
    expect(actionCreators.addProtocol({})).toEqual(expectedAction);
  });
});
