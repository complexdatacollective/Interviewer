/* eslint-env jest */

import reducer, { actionCreators } from '../protocol';

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

  it('setProtocol() sets protocol on state and changes the loaded state', () => {
    expect(
      reducer(
        initialState,
        actionCreators.setProtocol(
          '/tmp/foo/mockPath.protocol',
          { stages: [{ foo: 'bar' }] },
        ),
      ),
    ).toEqual({
      ...initialState,
      path: '/tmp/foo/mockPath.protocol',
      stages: [{ foo: 'bar' }],
      isLoaded: true,
      isLoading: false,
    });
  });

  it('downloadProtocol()', () => {
    expect(
      reducer(
        initialState,
        actionCreators.downloadProtocol(
          'https://tmp/foo/mockPath.protocol',
        ),
      ),
    ).toEqual({
      ...initialState,
      isLoaded: false,
      isLoading: true,
    });
  });

  it('importProtocol()', () => {
    expect(
      reducer(
        initialState,
        actionCreators.importProtocol(
          '/tmp/foo/mockPath.protocol',
        ),
      ),
    ).toEqual({
      ...initialState,
      isLoaded: false,
      isLoading: true,
    });
  });

  it('loadProtocol()', () => {
    expect(
      reducer(
        initialState,
        actionCreators.loadProtocol(
          '/tmp/foo/mockPath.protocol',
        ),
      ),
    ).toEqual({
      ...initialState,
      isLoaded: false,
      isLoading: true,
    });
  });

  it('loadFactoryProtocol()', () => {
    expect(
      reducer(
        initialState,
        actionCreators.loadFactoryProtocol(
          '/tmp/foo/mockPath.protocol',
        ),
      ),
    ).toEqual({
      ...initialState,
      isLoaded: false,
      isLoading: true,
    });
  });
});
