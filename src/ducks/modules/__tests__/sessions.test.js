/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../sessions';

const mockState = {};

const UIDPattern = /([A-Za-z0-9]+-[A-Za-z0-9]*)+/;

describe('network reducer', () => {
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

    expect(newState).toEqual({
      undefined: {
        path: 'path/to/session',
        network: { ego: {}, nodes: [], edges: [] },
        promptIndex: 0,
      },
    });
  });

  it('should handle UPDATE_SESSION', () => {
    const newState = reducer(
      {
        ...mockState,
        session1: {
          path: 'path/to/session',
          network: {},
        },
      },
      {
        type: actionTypes.UPDATE_SESSION,
        sessionId: 'session1',
        path: 'new/path/to/session',
      },
    );

    expect(newState.session1).toEqual({
      path: 'new/path/to/session',
      network: {},
      promptIndex: 0,
    });
  });


  it('should handle UPDATE_PROMPT', () => {
    const newState = reducer(
      {
        ...mockState,
        session1: {
          path: 'path/to/session',
          network: {},
        },
      },
      {
        type: actionTypes.UPDATE_PROMPT,
        sessionId: 'session1',
        promptIndex: 2,
      },
    );

    expect(newState.session1).toEqual({
      path: 'path/to/session',
      network: {},
      promptIndex: 2,
    });
  });

  it('should handle REMOVE_SESSION', () => {
    const newState = reducer(
      {
        ...mockState,
        session1: {
          path: 'path/to/session',
          network: {},
        },
      },
      {
        type: actionTypes.REMOVE_SESSION,
        sessionId: 'session1',
      },
    );

    expect(newState.session1).toEqual(undefined);
  });
});

describe('sessions actions', () => {
  it('should create an ADD_NODES action with a single node', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODES,
      sessionId: 'a',
      nodes: [{ name: 'foo' }],
    };

    expect(actionCreators.addNodes('a', { name: 'foo' })).toMatchObject(expectedAction);
  });

  it('should create an ADD_NODES action for batch adding', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODES,
      sessionId: 'a',
      nodes: [{ name: 'foo' }, { name: 'bar' }],
    };

    const action = actionCreators.addNodes('a', [{ name: 'foo' }, { name: 'bar' }]);
    expect(action).toEqual(expectedAction);
  });

  it('should create an UPDATE_NODE action', () => {
    const expectedAction = {
      type: actionTypes.UPDATE_NODE,
      sessionId: 'a',
      node: {},
      full: false,
    };

    expect(actionCreators.updateNode('a', {})).toEqual(expectedAction);
  });

  it('should create a TOGGLE_NODE_ATTRIBUTES action', () => {
    const expectedAction = {
      type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
      sessionId: 'a',
      uid: 2,
      attributes: {},
    };

    expect(actionCreators.toggleNodeAttributes('a', 2, {})).toEqual(expectedAction);
  });

  it('should create a REMOVE_NODE action', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_NODE,
      sessionId: 'a',
      uid: 2,
    };

    expect(actionCreators.removeNode('a', 2)).toEqual(expectedAction);
  });

  it('should add create an ADD_EDGE action', () => {
    const edge = { from: 'foo', to: 'bar', type: 'friend' };
    const expectedAction = {
      type: actionTypes.ADD_EDGE,
      sessionId: 'a',
      edge,
    };

    expect(actionCreators.addEdge('a', edge)).toEqual(expectedAction);
  });

  it('should add create a REMOVE_EDGE action', () => {
    const edge = { from: 'foo', to: 'bar', type: 'friend' };
    const expectedAction = {
      type: actionTypes.REMOVE_EDGE,
      sessionId: 'a',
      edge,
    };

    expect(actionCreators.removeEdge('a', edge)).toEqual(expectedAction);
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
    const expectedAction = {
      type: actionTypes.UPDATE_PROMPT,
      sessionId: 'a',
      promptIndex: 2,
    };

    expect(actionCreators.updatePrompt('a', 2)).toEqual(expectedAction);
  });

  it('should add create a REMOVE_SESSION action', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_SESSION,
      sessionId: 'a',
    };

    expect(actionCreators.removeSession('a')).toEqual(expectedAction);
  });
});
