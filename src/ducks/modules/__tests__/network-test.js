/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../network';

const mockState = {
  ego: {},
  nodes: [],
  edges: [],
};

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(mockState);
  });

  it('should handle ADD_NODE', () => {
    const newState = reducer({
      ...mockState,
      nodes: [
        { id: 1, name: 'baz' },
      ],
    }, {
      type: actionTypes.ADD_NODE,
      node: { name: 'foo' },
    });

    expect(newState.nodes.length).toBe(2);
    expect(newState.nodes[0]).toEqual({ id: 1, name: 'baz' });

    const newNode = newState.nodes[1];
    expect(newNode.id).toEqual(2);
    expect(newNode.name).toEqual('foo');
    expect(newNode.uid).toMatch(/[0-9]+_[0-9]+/);
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
  it('should create an ADD_NODE action', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODE,
      node: { name: 'foo' },
    };

    expect(actionCreators.addNode({ name: 'foo' })).toEqual(expectedAction);
  });

  it('should create a REMOVE_NODE action', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_NODE,
      uid: 2,
    };

    expect(actionCreators.removeNode(2)).toEqual(expectedAction);
  });
});
