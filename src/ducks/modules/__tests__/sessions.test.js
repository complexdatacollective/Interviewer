/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, { getReducer, actionCreators, actionTypes } from '../sessions';
import { actionTypes as networkActionTypes, actionCreators as networkActions } from '../network';
import { actionTypes as installedProtocolsActionTypes } from '../installedProtocols';

const mockSessionId = 'session-1';

vi.mock('../network');
vi.mock('uuid/v4', () => ({
  default: vi.fn(() => mockSessionId),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockState = {};

const now = Date.now();
vi.spyOn(Date, 'now').mockReturnValue(now);

const mockStateWithSession = {
  ...mockState,
  [mockSessionId]: {
    caseId: undefined,
    protocolUID: undefined,
    network: { ego: {}, nodes: [], edges: [] },
  },
};

const mockStateWithProtocol = {
  ...mockState,
  [mockSessionId]: {
    caseId: undefined,
    protocolUID: '1234',
    network: { ego: {}, nodes: [], edges: [] },
  },
};

describe('sessions', () => {
  describe('reducer', () => {
    beforeEach(() => {
      // networkReducer.mockClear();
    });

    it('should handle ADD_SESSION', () => {
      const newState = reducer({},
        {
          type: actionTypes.ADD_SESSION,
          caseId: 'case1',
          sessionId: 'a',
          protocolUID: 'mockProtocol',
        });

      expect(newState).toEqual({
        a: {
          caseId: 'case1',
          startedAt: now,
          network: {
            ego: {
              _uid: 'session-1',
              attributes: {},
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
        });

      expect(newState[mockSessionId]).toEqual(expect.objectContaining({
        caseId: undefined,
        network: { edges: [], ego: {}, nodes: [] },
        protocolUID: undefined,
      }));
    });

    it('should handle UPDATE_CASE_ID', () => {
      const newState = reducer(mockStateWithSession,
        {
          type: actionTypes.UPDATE_CASE_ID,
          sessionId: mockSessionId,
          caseId: 'case2',
        });

      expect(newState[mockSessionId]).toEqual(expect.objectContaining({
        caseId: 'case2',
        network: { edges: [], ego: {}, nodes: [] },
        protocolUID: undefined,
      }));
    });

    it('should handle DELETE_PROTOCOL', () => {
      const newState = reducer(mockStateWithProtocol,
        {
          type: installedProtocolsActionTypes.DELETE_PROTOCOL,
          protocolUID: '1234',
        });

      expect(newState).toEqual(mockState);
    });

    it('should handle UPDATE_PROMPT', () => {
      const newState = reducer(mockStateWithSession,
        {
          type: actionTypes.UPDATE_PROMPT,
          sessionId: mockSessionId,
          promptIndex: 2,
        });

      expect(newState[mockSessionId]).toEqual(expect.objectContaining({
        caseId: undefined,
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
        });

      expect(newState[mockSessionId]).toEqual(undefined);
    });

    it('network actions defer to network reducer', () => {
      const mockNetworkReducer = vi.fn();
      const sessionReducer = getReducer(mockNetworkReducer);

      const networkActionList = [
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

      networkActionList.forEach((actionType) => {
        const state = {
          a: { network: { } },
        };
        const action = { type: actionType, sessionId: 'a' };
        sessionReducer(state, action);
      });

      expect(mockNetworkReducer.mock.calls.length).toBe(11);
    });
  });

  describe('actions', () => {
    it('batchAddNodes should dispatch network.batchAddNodes action with sessionId', () => {
      const nodeList = [{ bazz: 'buzz' }];
      const attributeData = { foo: 'bar' };
      const type = 'mockType';
      const defaultProperties = {
        a: null,
        b: null,
        c: null,
      };

      const store = mockStore({
        activeSessionId: 'mockSession',
        sessions: {
          mockSession: {
            protocolUID: 'mockProtocol',
          },
        },
        installedProtocols: {
          mockProtocol: {
            codebook: {
              node: {
                mockType: {
                  variables: {
                    a: { type: 'string' },
                    b: { type: 'boolean' },
                    c: { type: 'categorical' },
                  },
                },
              },
            },
          },
        },
      });

      store.dispatch(actionCreators.batchAddNodes(nodeList, attributeData, type));

      expect(networkActions.batchAddNodes.mock.calls).toEqual([[
        nodeList,
        attributeData,
        defaultProperties,
      ]]);

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0]).toMatchObject({ sessionId: 'mockSession' });
    });

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
