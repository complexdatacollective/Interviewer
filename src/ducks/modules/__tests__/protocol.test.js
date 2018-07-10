/* eslint-env jest */

import { ActionsObservable } from 'redux-observable';
import { omit } from 'lodash';

import reducer, { actionCreators, epics } from '../protocol';
import { actionTypes as SessionActionTypes } from '../session';
import environments from '../../../utils/environments';
import { getEnvironment } from '../../../utils/Environment';

jest.mock('../../../utils/protocol/index');

const initialState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  name: '',
  version: '',
  required: '',
  type: 'factory',
  stages: [],
};

describe('protocol module', () => {
  describe('reducer', () => {
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
        type: 'download',
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

    it('should clear protocol state when session ends', () => {
      const newState = reducer(
        initialState,
        actionCreators.setProtocol(
          '/tmp/foo/mockPath.protocol',
          { stages: [{ foo: 'bar' }] },
        ),
      );
      expect(
        reducer(newState, { type: SessionActionTypes.END_SESSION }),
      ).toEqual(initialState);
    });
  });

  describe('epics', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('downloadProtocolEpic', () => {
      const action$ = ActionsObservable.of(
        actionCreators.downloadProtocol('https://tmp/foo/mockPath.protocol'),
      );

      const expectedActions = [actionCreators.importProtocol('/downloaded/protocol/to/temp/path')];
      return epics(action$).toArray().toPromise().then((result) => {
        expect(result).toEqual(expectedActions);
      });
    });

    it('importProtocolEpic', () => {
      const action$ = ActionsObservable.of(
        actionCreators.importProtocol('/downloaded/protocol/to/temp/path'),
      );

      const expectedActions = [actionCreators.loadProtocol('/app/data/protocol/path')];
      return epics(action$).toArray().toPromise().then((result) => {
        expect(result.map(element => omit(element, 'sessionId'))).toEqual(
          expectedActions.map(action => omit(action, 'sessionId')));
      });
    });

    it('loadProtocolEpic', () => {
      const action$ = ActionsObservable.of(
        actionCreators.loadProtocol('/app/data/protocol/path'),
      );

      const expectedActions = [actionCreators.setProtocol(
        '/app/data/protocol/path',
        { fake: { protocol: { json: true } } },
        false,
      )];
      return epics(action$).toArray().toPromise().then((result) => {
        expect(result).toEqual(expectedActions);
      });
    });

    it('loadFactoryProtocolEpic', () => {
      const action$ = ActionsObservable.of(
        actionCreators.loadFactoryProtocol('factory_protocol_name'),
      );

      const expectedActions = [actionCreators.setProtocol(
        'factory_protocol_name',
        { fake: { factory: { protocol: { json: true } } } },
        true,
      )];
      return epics(action$).toArray().toPromise().then((result) => {
        expect(result).toEqual(expectedActions);
      });
    });
  });
});
