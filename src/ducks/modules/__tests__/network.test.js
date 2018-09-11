/* eslint-env jest */

import reducer, { actionTypes, nodePrimaryKeyProperty as PK } from '../network';

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
        nodes: [{ id: 1, attributes: { name: 'baz' } }],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ attributes: { name: 'foo' } }],
      },
    );

    expect(newState.nodes.length).toBe(2);
    expect(newState.nodes[0]).toEqual({ id: 1, attributes: { name: 'baz' } });

    const newNode = newState.nodes[1];
    expect(newNode.attributes.name).toEqual('foo');
    expect(newNode[PK]).toMatch(UIDPattern);
  });

  it('should handle ADD_NODES', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, attributes: { name: 'baz' } }],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ attributes: { name: 'foo' } }, { attributes: { name: 'bar' } }],
      },
    );

    expect(newState.nodes.length).toBe(3);
    expect(newState.nodes[0]).toEqual({ [PK]: 1, attributes: { name: 'baz' } });
    expect(newState.nodes[1]).toMatchObject({ attributes: { name: 'foo' }, [PK]: expect.stringMatching(UIDPattern) });
    expect(newState.nodes[2]).toMatchObject({ attributes: { name: 'bar' }, [PK]: expect.stringMatching(UIDPattern) });
  });

  it('preserves UID when adding a node', () => {
    const newState = reducer(
      mockState,
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ attributes: { name: 'foo' }, [PK]: '22' }],
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
        nodes: [{ attributes: { name: 'foo' } }, { attributes: { name: 'bar' } }],
        additionalAttributes: { stageId: '2', attributes: { isFriend: true } },
      },
    );

    expect(newState.nodes[0].stageId).toBe('2');
    expect(newState.nodes[1].stageId).toBe('2');
    expect(newState.nodes[0].attributes.isFriend).toBe(true);
    expect(newState.nodes[1].attributes.isFriend).toBe(true);
    expect(newState.nodes[0].attributes.name).toEqual('foo');
    expect(newState.nodes[1].attributes.name).toEqual('bar');
  });

  it('should prefer node.attributes to additionalAttributes.attributes ', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [],
      },
      {
        type: actionTypes.ADD_NODES,
        nodes: [{ attributes: { name: 'foo' } }],
        additionalAttributes: { attributes: { name: 'defaultName' } },
      },
    );
    expect(newState.nodes[0].attributes.name).toEqual('foo');
  });

  it('should handle REMOVE_NODE', () => {
    expect(
      reducer(
        {
          ...mockState,
          nodes: [{ [PK]: 1, attributes: { name: 'foo' } }, { [PK]: 2, attributes: { name: 'bar' } }, { [PK]: 3, attributes: { name: 'baz' } }],
        },
        {
          type: actionTypes.REMOVE_NODE,
          [PK]: 2,
        },
      ),
    ).toEqual({
      ...mockState,
      nodes: [{ [PK]: 1, attributes: { name: 'foo' } }, { [PK]: 3, attributes: { name: 'baz' } }],
    });
  });

  it('removes any edges containing a removed node', () => {
    const state = {
      nodes: [{ [PK]: 1 }, { [PK]: 2 }, { [PK]: 3 }],
      edges: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 3 }],
    };
    const newState = reducer(state, { type: actionTypes.REMOVE_NODE, [PK]: 1 });
    expect(newState.edges).not.toContainEqual(state.edges[0]);
    expect(newState.edges).not.toContainEqual(state.edges[1]);
    expect(newState.edges).toContainEqual(state.edges[2]);
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

  it('toggles node attributes on', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, attributes: { name: 'foo' } }, { [PK]: 2, attributes: { name: 'bar' } }],
      },
      {
        type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
        [PK]: 1,
        attributes: { stage: 1 },
      },
    );

    expect(newState.nodes[0].attributes.stage).toEqual(1);
    expect(newState.nodes[1].attributes.stage).toEqual(undefined);
  });

  it('toggles node attributes off', () => {
    const secondState = reducer(
      {
        ...mockState,
        nodes: [{ [PK]: 1, attributes: { stage: 1, name: 'foo' } }, { [PK]: 2, attributes: { stage: 1, name: 'bar' } }],
      },
      {
        type: actionTypes.TOGGLE_NODE_ATTRIBUTES,
        [PK]: 2,
        attributes: { stage: 1 },
      },
    );

    expect(secondState.nodes[0].attributes.stage).toEqual(1);
    expect(secondState.nodes[1].attributes.stage).toEqual(undefined);
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
