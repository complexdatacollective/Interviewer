/* eslint-env jest */

import reducer, {actionCreators, actionTypes} from '../../modules/network';

const initialState = {
  ego: {},
  nodes: [],
  edges: [],
};

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(initialState)
  });

  it('should handle ADD_NODE', () => {
    expect(
      reducer(initialState, {
        type: actionTypes.ADD_NODE,
        node: { name: 'foo' },
      })
    ).toEqual(
      {
        ...initialState,
        nodes: [
          { name: 'foo' },
        ],
      }
    )

  });

  it('should handle REMOVE_NODE', () => {
    expect(
      reducer({
        ...initialState,
        nodes: [
          { name: 'foo', },
          { name: 'bar', },
        ],
      }, {
        type: actionTypes.REMOVE_NODE,
        index: 0,
      })
    ).toEqual(
      {
        ...initialState,
        nodes: [
          { name: 'bar' },
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
