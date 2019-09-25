/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import uuidv4 from '../../../utils/uuid';
import reducer, { actionCreators, actionTypes } from '../sessions';
import networkReducer, { actionTypes as networkActionTypes } from '../network';
import { actionTypes as installedProtocolsActionTypes } from '../installedProtocols';

jest.mock('../network');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockState = {};

const now = Date.now();
Date.now = jest.fn().mockReturnValue(now);

const mockSessionId = 'session-1';

const mockStateWithSession = {
  ...mockState,
  [mockSessionId]: {
    caseID: undefined,
    protocolUID: undefined,
    network: { ego: {}, nodes: [], edges: [] },
  },
};

const mockStateWithProtocol = {
  ...mockState,
  [mockSessionId]: {
    caseID: undefined,
    protocolUID: '1234',
    network: { ego: {}, nodes: [], edges: [] },
  },
};

jest.mock('../../../utils/uuid');
uuidv4.mockImplementation(() => mockSessionId);

describe('sessions', () => {
  describe('reducer', () => {
    beforeEach(() => {
      networkReducer.mockClear();
    });

    it('should handle ADD_SESSION', () => {
      const newState = reducer({},
        {
          type: actionTypes.ADD_SESSION,
          caseId: 'case1',
          sessionId: 'a',
          protocolUID: 'mockProtocol',
        },
      );

      expect(newState).toEqual({
        a: {
          caseId: 'case1',
          network: {
            ego: {
              _uid: 'session-1',
            },
            nodes: [],
            edges: [],
          },
          promptIndex: 0,
          protocolUID: 'mockProtocol',
          stageIndex: 0,
          updatedAt: now,
        },
      });
    });

    it('should handle UPDATE_SESSION', () => {
      const newState = reducer(mockStateWithSession,
        {
          type: actionTypes.UPDATE_SESSION,
          sessionId: mockSessionId,
        },
      );

      expect(newState[mockSessionId]).toEqual(expect.objectContaining({
        caseID: undefined,
        network: { edges: [], ego: {}, nodes: [] },
        protocolUID: undefined,
      }));
    });

    it('should handle DELETE_PROTOCOL', () => {
      const newState = reducer(mockStateWithProtocol,
        {
          type: installedProtocolsActionTypes.DELETE_PROTOCOL,
          protocolUID: '1234',
        },
      );

      expect(newState).toEqual(mockState);
    });


    it('should handle UPDATE_PROMPT', () => {
      const newState = reducer(mockStateWithSession,
        {
          type: actionTypes.UPDATE_PROMPT,
          sessionId: mockSessionId,
          promptIndex: 2,
        },
      );

      expect(newState[mockSessionId]).toEqual(expect.objectContaining({
        caseID: undefined,
        network: { edges: [], ego: {}, nodes: [] },
        protocolUID: undefined,
        promptIndex: 2,
      }));
    });

    it('should handle REMOVE_SESSION', () => {
      const newState = reducer(mockStateWithSession,
        {
          type: actionTypes.REMOVE_SESSION,
          sessionId: mockSessionId,
        },
      );

      expect(newState[mockSessionId]).toEqual(undefined);
    });

    it('network actions defer to network reducer', () => {
      const networkActions = [
        networkActionTypes.ADD_NODE,
        networkActionTypes.BATCH_ADD_NODES,
        networkActionTypes.REMOVE_NODE,
        networkActionTypes.REMOVE_NODE_FROM_PROMPT,
        networkActionTypes.UPDATE_NODE,
        networkActionTypes.TOGGLE_NODE_ATTRIBUTES,
        networkActionTypes.ADD_EDGE,
        networkActionTypes.UPDATE_EDGE,
        networkActionTypes.TOGGLE_EDGE,
        networkActionTypes.REMOVE_EDGE,
        networkActionTypes.UPDATE_EGO,
      ];

      networkActions.forEach((actionType) => {
        reducer({ a: { network: {} } }, { type: actionType, sessionId: 'a' });
      });

      expect(networkReducer.mock.calls.length).toBe(11);
    });
  });

  describe('actions', () => {
    it('should add an UPDATE_PROMPT action', () => {
      const store = mockStore({ activeSessionId: 'a', sessions: { a: {} } });

      const expectedAction = {
        type: actionTypes.UPDATE_PROMPT,
        sessionId: 'a',
        promptIndex: 2,
      };

      store.dispatch(actionCreators.updatePrompt(2));
      expect(store.getActions()).toEqual([expectedAction]);
    });

    it('should add create a REMOVE_SESSION action', () => {
      const expectedAction = {
        type: actionTypes.REMOVE_SESSION,
        sessionId: 'a',
      };

      expect(actionCreators.removeSession('a')).toEqual(expectedAction);
    });

    it('removeEdge should dispatch REMOVE_EDGE action', () => {
      const expectedAction = {
        type: networkActionTypes.REMOVE_EDGE,
        sessionId: 'a',
        edgeId: 123,
      };

      const store = mockStore({ activeSessionId: 'a' });
      store.dispatch(actionCreators.removeEdge(123));
      expect(store.getActions()).toEqual([expectedAction]);
    });
  });
});
