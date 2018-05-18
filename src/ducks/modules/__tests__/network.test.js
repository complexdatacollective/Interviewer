/* eslint-env jest */

import reducer, { actionTypes } from '../network';

const mockState = {
  ego: {},
  nodes: [],
  edges: [],
};

const UIDPattern = /[0-9]+_[0-9]+/;

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(mockState);
  });

  it('should handle ADD_NODES with a single node', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ id: 1, name: 'baz' }],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ name: 'foo' }],
      },
    );

    expect(newState.nodes.length).toBe(2);
    expect(newState.nodes[0]).toEqual({ id: 1, name: 'baz' });

    const newNode = newState.nodes[1];
    expect(newNode.id).toEqual(2);
    expect(newNode.name).toEqual('foo');
    expect(newNode.uid).toMatch(UIDPattern);
  });

  it('should handle ADD_NODES', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ id: 1, name: 'baz' }],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ name: 'foo' }, { name: 'bar' }],
      },
    );

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
    const newState = reducer(
      {
        ...mockState,
        nodes: [],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ name: 'foo' }, { name: 'bar' }],
        additionalAttributes: { stage: 1 },
      },
    );

    expect(newState.nodes[0].stage).toEqual(1);
    expect(newState.nodes[1].stage).toEqual(1);
  });

  it('should handle REMOVE_NODE', () => {
    expect(
      reducer(
        {
          ...mockState,
          nodes: [{ uid: 1, name: 'foo' }, { uid: 2, name: 'bar' }, { uid: 3, name: 'baz' }],
        },
        {
          type: actionTypes.REMOVE_NODE,
          uid: 2,
        },
      ),
    ).toEqual({
      ...mockState,
      nodes: [{ uid: 1, name: 'foo' }, { uid: 3, name: 'baz' }],
    });
  });

  it('should handle UPDATE_NODE', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ uid: 1, id: 1, name: 'baz' }],
      },
      {
        type: actionTypes.UPDATE_NODE,
        node: { uid: 1, name: 'foo' },
      },
    );
    expect(newState.nodes[0]).toEqual({ uid: 1, id: 1, name: 'foo' });
  });

  it('should handle TOGGLE_NODE_ATTRIBUTES', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ uid: 1, name: 'foo' }, { uid: 2, name: 'bar' }],
      },
      {
        type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
        uid: 1,
        attributes: { stage: 1 },
      },
    );

    expect(newState.nodes[0].stage).toEqual(1);
    expect(newState.nodes[1].stage).toEqual(undefined);

    const secondState = reducer(
      {
        ...mockState,
        nodes: [{ uid: 1, stage: 1, name: 'foo' }, { uid: 2, stage: 1, name: 'bar' }],
      },
      {
        type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
        uid: 2,
        attributes: { stage: 1 },
      },
    );

    expect(secondState.nodes[0].stage).toEqual(1);
    expect(secondState.nodes[1].stage).toEqual(undefined);
  });

  it('should handle ADD_EDGE', () => {
    const edge = { from: 'foo', to: 'bar', type: 'friend' };
    expect(reducer(mockState, { type: actionTypes.ADD_EDGE, edge })).toEqual(
      {
        ...mockState,
        edges: [edge],
      },
    );
  });

  it('should handle TOGGLE_EDGE', () => {
    const edgeA = { from: 'foo', to: 'bar', type: 'friend' };
    const edgeB = { from: 'asdf', to: 'qwerty', type: 'friend' };
    expect(reducer(
      { ...mockState, edges: [edgeA, edgeB] },
      { type: actionTypes.TOGGLE_EDGE, edge: edgeA })).toEqual(
      {
        ...mockState,
        edges: [edgeB],
      },
    );
    expect(reducer(
      { ...mockState, edges: [edgeB] },
      { type: actionTypes.TOGGLE_EDGE, edge: edgeA })).toEqual(
      {
        ...mockState,
        edges: [edgeB, edgeA],
      },
    );
  });

  it('should handle REMOVE_EDGE', () => {
    const edgeA = { from: 'foo', to: 'bar', type: 'friend' };
    const edgeB = { from: 'asdf', to: 'qwerty', type: 'friend' };
    expect(reducer(
      { ...mockState, edges: [edgeA, edgeB] },
      { type: actionTypes.REMOVE_EDGE, edge: edgeA })).toEqual(
      {
        ...mockState,
        edges: [edgeB],
      },
    );
  });
});
