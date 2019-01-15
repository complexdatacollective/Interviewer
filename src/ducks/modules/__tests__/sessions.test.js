/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import reducer, { actionCreators, actionTypes } from '../sessions';
import { nodePrimaryKeyProperty } from '../network';
import uuidv4 from '../../../utils/uuid';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockState = {};

const mockSessionId = 'session-1';

const mockStateWithSession = {
  ...mockState,
  [mockSessionId]: {
    path: 'path/to/session',
    network: { ego: {}, nodes: [], edges: [] },
  },
};

const UIDPattern = /([A-Za-z0-9]+-[A-Za-z0-9]*)+/;

jest.mock('../../../utils/uuid');
uuidv4.mockImplementation(() => mockSessionId);

describe('sessions reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(mockState);
  });

  it('should handle ADD_SESSION', () => {
    const newState = reducer(mockState,
      {
        type: actionTypes.ADD_SESSION,
        path: 'path/to/session',
      },
    );

    expect(newState).toMatchObject({
      undefined: {
        path: 'path/to/session',
        network: { ego: {}, nodes: [], edges: [] },
        promptIndex: 0,
      },
    });
  });

  it('should handle UPDATE_SESSION', () => {
    const newState = reducer(mockStateWithSession,
      {
        type: actionTypes.UPDATE_SESSION,
        sessionId: mockSessionId,
        path: 'new/path/to/session',
      },
    );

    expect(newState[mockSessionId]).toMatchObject({
      path: 'new/path/to/session',
      network: {},
      promptIndex: 0,
    });
  });


  it('should handle UPDATE_PROMPT', () => {
    const newState = reducer(mockStateWithSession,
      {
        type: actionTypes.UPDATE_PROMPT,
        sessionId: mockSessionId,
        promptIndex: 2,
      },
    );

    expect(newState[mockSessionId]).toMatchObject({
      path: 'path/to/session',
      network: {},
      promptIndex: 2,
    });
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

  it('should handle ADD_NODE', () => {
    const newState = reducer(mockStateWithSession,
      {
        type: actionTypes.ADD_NODE,
        sessionId: mockSessionId,
        modelData: {},
        attributeData: {},
      },
    );
    expect(newState[mockSessionId].network.nodes).toHaveLength(1);
  });

  it('should throw if ADD_NODES called without an active session', () => {
    expect(() => reducer(mockState,
      {
        type: actionTypes.ADD_NODE,
        sessionId: 'a',
        nodes: [{}],
      },
    )).toThrowError(/property.*undefined/);
  });
});

describe('sessions actions', () => {
  it('should create an BATCH_ADD_NODES action for batch adding', () => {
    const store = mockStore({
      sessions: { a: {} },
      session: 'a',
      protocol: {
        variableRegistry: {
          node: {
            nodeType: {
              variables: {},
            },
          },
        },
      },
    });

    const expectedAction = {
      type: actionTypes.BATCH_ADD_NODES,
      sessionId: 'a',
      nodeList: [],
      attributeData: {},
      registryForTypes: {},
    };

    store.dispatch(actionCreators.batchAddNodes([], {}));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should create an UPDATE_NODE action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

    const expectedAction = {
      type: actionTypes.UPDATE_NODE,
      sessionId: 'a',
      nodeId: {},
      newAttributeData: null,
      newModelData: {},
    };

    store.dispatch(actionCreators.updateNode({}, {}));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should create a TOGGLE_NODE_ATTRIBUTES action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

    const expectedAction = {
      type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
      sessionId: 'a',
      [nodePrimaryKeyProperty]: 2,
      attributes: {},
    };

    store.dispatch(actionCreators.toggleNodeAttributes(2, {}));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should create a REMOVE_NODE action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

    const expectedAction = {
      type: actionTypes.REMOVE_NODE,
      sessionId: 'a',
      [nodePrimaryKeyProperty]: 2,
    };

    store.dispatch(actionCreators.removeNode(2));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should add create an ADD_EDGE action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

    const edge = { from: 'foo', to: 'bar', type: 'friend' };
    const expectedAction = {
      type: actionTypes.ADD_EDGE,
      sessionId: 'a',
      edge,
    };

    store.dispatch(actionCreators.addEdge(edge));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should add create a REMOVE_EDGE action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

    const edge = { from: 'foo', to: 'bar', type: 'friend' };
    const expectedAction = {
      type: actionTypes.REMOVE_EDGE,
      sessionId: 'a',
      edge,
    };

    store.dispatch(actionCreators.removeEdge(edge));
    expect(store.getActions()).toEqual([expectedAction]);
  });

  it('should add create an ADD_SESSION action', () => {
    const expectedAction = {
      type: actionTypes.ADD_SESSION,
      sessionId: undefined,
      path: '/session/undefined',
    };

    const actualAction = actionCreators.addSession();
    expect(actualAction.type).toEqual(expectedAction.type);
    expect(actualAction.sessionId).toMatch(UIDPattern);
  });

  it('should add create an UPDATE_SESSION action', () => {
    const expectedAction = {
      type: actionTypes.UPDATE_SESSION,
      sessionId: 'a',
      path: '/updated/path',
    };

    expect(actionCreators.updateSession('a', '/updated/path')).toEqual(expectedAction);
  });

  it('should add create an UPDATE_PROMPT action', () => {
    const store = mockStore({ sessions: { a: {} }, session: 'a' });

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
});
