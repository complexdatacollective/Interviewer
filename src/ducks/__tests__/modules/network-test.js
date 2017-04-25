/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../../modules/network';

const mockState = {
  ego: {},
  nodes: [],
  edges: [],
};

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(mockState)
  });

  it('should handle ADD_NODE', () => {
    expect(
      reducer({
        ...mockState,
        nodes: [
          { id: 1, name: 'baz' }
        ],
      }, {
        type: actionTypes.ADD_NODE,
        node: { name: 'foo' },
      })
    ).toEqual(
      {
        ...mockState,
        nodes: [
          { id: 1, name: 'baz' },
          { id: 2, name: 'foo' },
        ],
      }
    )

  });

  it('should handle REMOVE_NODE', () => {
    expect(
      reducer({
        ...mockState,
        nodes: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' },
          { id: 3, name: 'baz' },
        ],
      }, {
        type: actionTypes.REMOVE_NODE,
        id: 2,
      })
    ).toEqual(
      {
        ...mockState,
        nodes: [
          { id: 1, name: 'foo' },
          { id: 3, name: 'baz' },
        ],
      }
    )
  });


});

describe('session actions', () => {
  it('should create an ADD_NODE action', () => {
    const expectedAction = {
      type: actionTypes.ADD_NODE,
      node: { name: 'foo' },
    }

    expect(actionCreators.addNode({ name: 'foo' })).toEqual(expectedAction)
  })

  it('should create a REMOVE_NODE action', () => {
    const expectedAction = {
      type: actionTypes.REMOVE_NODE,
      index: 2,
    }

    expect(actionCreators.removeNode(2)).toEqual(expectedAction)
  })
})
