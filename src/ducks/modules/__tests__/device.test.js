/* eslint-env jest */
import reducer, { actionCreators, actionTypes } from '../device';

const initialState = {};
const mockDescription = 'My Android Tablet';

describe('device reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return a device description', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.SET_DESCRIPTION, description: mockDescription });
    expect(reduced).toEqual({ description: mockDescription });
  });
});

describe('device actions', () => {
  it('should set a description', () => {
    const expectedAction = { type: actionTypes.SET_DESCRIPTION, description: mockDescription };
    expect(actionCreators.setDescription(mockDescription)).toEqual(expectedAction);
  });
});
