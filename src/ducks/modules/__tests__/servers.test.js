/* eslint-env jest */
import reducer, { actionCreators, actionTypes } from '../servers';

const initialState = { paired: [] };
const mockServer = { addresses: ['localhost'], port: 9999 };

describe('servers reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return an added server', () => {
    const reduced = reducer(initialState, { type: actionTypes.ADD_SERVER, server: mockServer });
    expect(reduced).toEqual({ paired: [mockServer] });
  });
});

describe('server actions', () => {
  it('should add a server', () => {
    const expectedAction = { type: actionTypes.ADD_SERVER, server: mockServer };
    expect(actionCreators.addServer(mockServer)).toEqual(expectedAction);
  });
});
