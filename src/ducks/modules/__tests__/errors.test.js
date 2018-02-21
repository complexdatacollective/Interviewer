/* eslint-env jest */

import reducer, { actionCreators } from '../errors';
import { actionCreators as protocolActions } from '../protocol';

const initialState = {
  errors: [],
  acknowledged: true,
};

describe('errors reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  it('acknowlege() should set acknowledge to true', () => {
    const newState = reducer(
      { ...initialState, acknowledged: false },
      actionCreators.acknowledge(),
    );
    expect(newState.acknowledged).toBe(true);
  });

  it('error() should set acknowledge to false, and add error to log, should respond to protocol errors as error()', () => {
    const actions = [
      actionCreators.error,
      protocolActions.loadProtocolFailed,
      protocolActions.importProtocolFailed,
      protocolActions.downloadProtocolFailed,
    ];

    actions.forEach((action) => {
      const error = new Error('this is an error');

      const newState = reducer(
        { acknowledged: true, errors: [] },
        action(error),
      );

      expect(newState.acknowledged).toBe(false);
      expect(newState.errors).toEqual([error]);
    });
  });
});
