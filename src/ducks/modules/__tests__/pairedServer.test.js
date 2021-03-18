/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import reducer, { actionCreators, actionTypes } from '../pairedServer';

const initialState = null;
const mockServer = { addresses: ['localhost'], port: 9999 };

describe('pairedServer reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(null);
  });

  it('returns the set server', () => {
    const reduced = reducer(initialState, { type: actionTypes.SET_SERVER, server: mockServer });
    expect(reduced).toEqual(mockServer);
  });

  it('decorates with client info', () => {
    const deviceId = 'deviceId';
    const deviceSecret = 'deviceSecret';
    const action = {
      type: actionTypes.SET_SERVER, server: mockServer, deviceId, deviceSecret,
    };
    const reduced = reducer(initialState, action);
    expect(reduced).toEqual({ ...mockServer, deviceId, deviceSecret });
  });

  it('unpairs a server', () => {
    const reduced = reducer(mockServer, { type: actionTypes.UNPAIR_SERVER });
    expect(reduced).toEqual(initialState);
  });
});

const runThunk = (action) => {
  const getState = jest.fn(() => ({}));
  const dispatch = jest.fn((thunk) => {
    if (typeof thunk !== 'function') {
      return thunk;
    }
    return thunk(dispatch, getState);
  });

  action(dispatch, getState);

  return {
    getState,
    dispatch,
  };
};

describe('pairedServer action creator', () => {
  it('supports setting a paired server', () => {
    const expectedAction = { type: actionTypes.SET_SERVER, server: mockServer };
    const { dispatch } = runThunk(
      actionCreators.setPairedServer(mockServer),
    );
    // expect(dispatch.mock.calls[0]).toEqual(expectedAction);
    expect(dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
    expect(dispatch.mock.calls[2][0]).toMatchObject({
      toast: { title: 'Pairing complete!' },
      type: 'TOASTS/ADD_TOAST',
    });
  });

  it('supports unpairing a server', () => {
    const expectedAction = { type: actionTypes.UNPAIR_SERVER };
    expect(actionCreators.unpairServer(mockServer)).toEqual(expectedAction);
  });
});
