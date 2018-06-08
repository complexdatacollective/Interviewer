/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../protocols';

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
});

describe('protocols actionCreators', () => {
  it('should provide a method to add a protocol', () => {
    const expectedAction = { type: actionTypes.ADD_PROTOCOL, protocol: {} };
    expect(actionCreators.addProtocol({})).toEqual(expectedAction);
  });
});
