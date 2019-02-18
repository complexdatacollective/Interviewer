/* eslint-env jest */

import reducer,
{ actionTypes,
  entityPrimaryKeyProperty as PK,
  entityAttributesProperty,
} from '../network';
import uuidv4 from '../../../utils/uuid';

jest.mock('../../../utils/uuid');

const mockEgoUID = 'session-1';

uuidv4.mockImplementation(() => mockEgoUID);

const mockState = {
  ego: {
    [PK]: mockEgoUID,
  },
  nodes: [],
  edges: [],
};

describe('network reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(mockState);
  });

  it('should handle ADD_NODE', () => {
    const newState = reducer(
      {
        ...mockState,
      },
      {
        type: actionTypes.ADD_NODE,
        modelData: { [PK]: '383a6119e94aa2a1b2e1a5e84b2936b753437a11' },
        attributeData: { name: 'foo' },
      },
    );
    expect(newState.nodes.length).toBe(1);
    expect(newState.nodes[0]).toEqual({ [PK]: '383a6119e94aa2a1b2e1a5e84b2936b753437a11', [entityAttributesProperty]: { name: 'foo' }, itemType: undefined, promptIDs: [undefined], stageId: undefined, type: undefined });

    const newNode = newState.nodes[0];
    expect(newNode.attributes.name).toEqual('foo');
  });

  it('preserves UID when adding a node', () => {
    const newState = reducer(
      mockState,
      {
        type: actionTypes.ADD_NODE,
        modelData: { [PK]: '22' },
        attributeData: { name: 'foo' },
      },
    );
    expect(newState.nodes[0][PK]).toEqual('22');
  });

  it('should support additionalProperties for ADD_NODE', () => {
    const newState = reducer(
      {
        ...mockState,
        nodes: [],
      },
      {
        type: actionTypes.ADD_NODE,
        modelData: {},
        attributeData: { name: 'foo', isFriend: true },
      },
    );

    expect(newState.nodes[0].attributes.isFriend).toBe(true);
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
        nodes: [{ [PK]: 1, id: 1, [entityAttributesProperty]: { name: 'baz' } }],
      },
      {
        type: actionTypes.UPDATE_NODE,
        nodeId: 1,
        newModelData: {},
        newAttributeData: { name: 'foo' },
      },
    );
    expect(newState.nodes[0]).toEqual({ [PK]: 1, id: 1, [entityAttributesProperty]: { name: 'foo' } });
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
    const edge = {
      modelData: {
        from: 'foo',
        to: 'bar',
        type: 'edgeType',
        [PK]: 1234,
      },
      attributeData: {},
    };

    expect(reducer(mockState, { type: actionTypes.ADD_EDGE, ...edge })).toEqual(
      {
        ...mockState,
        edges: [{
          ...edge.modelData,
          attributes: {
            ...edge.attributeData,
          },
        }],
      },
    );
  });

  it('should handle TOGGLE_EDGE', () => {
    const edgeA = {
      modelData: {
        from: 'foo',
        to: 'bar',
        type: 'friend',
        [PK]: 12345,
      },
      attributeData: {},
    };
    const edgeB = {
      modelData: {
        from: 'asdf',
        to: 'qwerty',
        type: 'friend',
        [PK]: 123456,
      },
      attributeData: {},
    };

    expect(reducer(
      {
        ...mockState,
        edges: [
          { ...edgeA.modelData, attributes: {} },
          { ...edgeB.modelData, attributes: {} },
        ],
      },
      {
        type: actionTypes.TOGGLE_EDGE,
        modelData: edgeA.modelData,
        attributeData: edgeA.attributeData,
      })).toEqual(
      {
        ...mockState,
        edges: [{ ...edgeB.modelData, attributes: {} }],
      },
    );
    expect(reducer(
      { ...mockState, edges: [{ ...edgeB.modelData, attributes: {} }] },
      {
        type: actionTypes.TOGGLE_EDGE,
        modelData: edgeA.modelData,
        attributeData: edgeA.attributeData,
      })).toEqual(
      {
        ...mockState,
        edges: [{ ...edgeB.modelData, attributes: {} }, { ...edgeA.modelData, attributes: {} }],
      },
    );
  });

  it('should handle REMOVE_EDGE', () => {
    const edgeA = { [PK]: 123, from: 'foo', to: 'bar', type: 'friend', attributes: {} };
    const edgeB = { [PK]: 1234, from: 'asdf', to: 'qwerty', type: 'friend', attributes: {} };
    expect(reducer(
      { ...mockState, edges: [edgeA, edgeB] },
      { type: actionTypes.REMOVE_EDGE, edgeId: 123 })).toEqual(
      {
        ...mockState,
        edges: [edgeB],
      },
    );
  });
});
