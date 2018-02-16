/* eslint-env jest */

import reducer from '../protocol';

const initialState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  name: '',
  version: '',
  required: '',
  stages: [],
};

describe('protocol reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  it('setProtocol()');
  it('downloadProtocol()');
  it('importProtocol()');
  it('loadProtocol()');
  it('loadFactoryProtocol()');
});
