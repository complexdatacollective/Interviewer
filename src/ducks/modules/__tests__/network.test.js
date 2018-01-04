/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../network';

const mockState = {
  ego: {},
  nodes: [],
  edges: [],
};

const UIDPattern = /[0-9]+_[0-9]+/;

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(mockState);
  });

  it('should handle ADD_NODES with a single node', () => {
    const newState = reducer({
      ...mockState,
      nodes: [
        { id: 1, name: 'baz' },
      ],
    }, {
      type: actionTypes.ADD_NODES,
      nodes: [{ name: 'foo' }],
    });

    expect(newState.nodes.length).toBe(2);
    expect(newState.nodes[0]).toEqual({ id: 1, name: 'baz' });

    const newNode = newState.nodes[1];
    expect(newNode.id).toEqual(2);
    expect(newNode.name).toEqual('foo');
    expect(newNode.uid).toMatch(UIDPattern);
  });

  it('should handle ADD_NODES', () => {
    const newState = reducer({
      ...mockState,
      nodes: [
        { id: 1, name: 'baz' },
      ],
    }, {
      type: actionTypes.ADD_NODES,
      nodes: [{ name: 'foo' }, { name: 'bar' }],
    });

    expect(newState.nodes.length).toBe(3);
    expect(newState.nodes[0]).toEqual({ id: 1, name: 'baz' });

    const node1 = newState.nodes[1];
    const node2 = newState.nodes[2];
    expect(node1).toMatchObject({ name: 'foo', id: 2 });
    expect(node1.uid).toMatch(UIDPattern);
    expect(node2).toMatchObject({ name: 'bar', id: 3 });
    expect(node2.uid).toMatch(UIDPattern);
  });

  it('should support additionalAttributes for ADD_NODES', () => {
    const newState = reducer({
      ...mockState,
      nodes: [],
    }, {
      type: actionTypes.ADD_NODES,
      nodes: [{ name: 'foo' }, { name: 'bar' }],
      additionalAttributes: { stage: 1 },
    });

    expect(newState.nodes[0].stage).toEqual(1);
    expect(newState.nodes[1].stage).toEqual(1);
  });

  it('should handle REMOVE_NODE', () => {
    expect(
      reducer({
        ...mockState,
        nodes: [
          { uid: 1, name: 'foo' },
          { uid: 2, name: 'bar' },
          { uid: 3, name: 'baz' },
        ],
      }, {
        type: actionTypes.REMOVE_NODE,
        uid: 2,
      }),
    ).toEqual(
      {
        ...mockState,
        nodes: [
          { uid: 1, name: 'foo' },
          { uid: 3, name: 'baz' },
        ],
      },
    );
  });
});

describe('session actions', () => {
  it('should create an ADD_NODES action with a single node', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODES,
      nodes: [{ name: 'foo' }],
    };

    expect(actionCreators.addNodes({ name: 'foo' })).toMatchObject(expectedAction);
  });

  it('should create an ADD_NODES action for batch adding', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODES,
      nodes: [{ name: 'foo' }, { name: 'bar' }],
    };

    const action = actionCreators.addNodes([{ name: 'foo' }, { name: 'bar' }]);
    expect(action).toEqual(expectedAction);
  });

  it('should create a REMOVE_NODE action', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_NODE,
      uid: 2,
    };

    expect(actionCreators.removeNode(2)).toEqual(expectedAction);
  });
});
