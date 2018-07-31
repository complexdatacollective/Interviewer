/* eslint-env jest */

import reducer, { actionTypes, NodePK as PK } from '../network';

const mockState = {
  ego: {},
  nodes: [],
  edges: [],
};

const UIDPattern = /[a-f\d]+-/;

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
    expect(newNode.name).toEqual('foo');
    expect(newNode[PK]).toMatch(UIDPattern);
  });

  it('should handle ADD_NODES', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, name: 'baz' }],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ name: 'foo' }, { name: 'bar' }],
      },
    );

    expect(newState.nodes.length).toBe(3);
    expect(newState.nodes[0]).toEqual({ [PK]: 1, name: 'baz' });
    expect(newState.nodes[1]).toMatchObject({ name: 'foo', [PK]: expect.stringMatching(UIDPattern) });
    expect(newState.nodes[2]).toMatchObject({ name: 'bar', [PK]: expect.stringMatching(UIDPattern) });
  });

  it('preserves UID when adding a node', () => {
    const newState = reducer(
      mockState,
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ name: 'foo', [PK]: '22' }],
      },
    );
    expect(newState.nodes[0][PK]).toEqual('22');
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
          nodes: [{ [PK]: 1, name: 'foo' }, { [PK]: 2, name: 'bar' }, { [PK]: 3, name: 'baz' }],
        },
        {
          type: actionTypes.REMOVE_NODE,
          uid: 2,
        },
      ),
    ).toEqual({
      ...mockState,
      nodes: [{ [PK]: 1, name: 'foo' }, { [PK]: 3, name: 'baz' }],
    });
  });

  it('should handle UPDATE_NODE', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, id: 1, name: 'baz' }],
      },
      {
        type: actionTypes.UPDATE_NODE,
        node: { [PK]: 1, name: 'foo' },
      },
    );
    expect(newState.nodes[0]).toEqual({ [PK]: 1, id: 1, name: 'foo' });
  });

  it('should handle TOGGLE_NODE_ATTRIBUTES', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, name: 'foo' }, { [PK]: 2, name: 'bar' }],
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
        nodes: [{ [PK]: 1, stage: 1, name: 'foo' }, { [PK]: 2, stage: 1, name: 'bar' }],
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
