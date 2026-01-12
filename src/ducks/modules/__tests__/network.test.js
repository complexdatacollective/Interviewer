/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */
import uuid from 'uuid/v4';
import {
  entityPrimaryKeyProperty as PK,
  entityAttributesProperty,
} from '@codaco/shared-consts';
import reducer,
{
  actionTypes,
  actionCreators,
} from '../network';

vi.mock('uuid');

const mockState = {
  ego: {
    [PK]: uuid(),
  },
  nodes: [],
  edges: [],
};

describe('network reducer', () => {
  it('should handle BATCH_ADD_NODE', () => {
    const mockNodeList = [
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: 'b868f61155ce8b570ae5f40337a6f64f5a72f199',
        attributes: {
          name: 'Jacqueline',
          overwriteInNode: 15,
          overwriteInStage: 57,
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '369927e6e432e609ffe921d8bca8d153cb9ba030',
        attributes: {
          name: 'Anthony',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '55cc9b1e72354d1d762003535a231e7b573a0360',
        attributes: {
          name: 'Benjamin',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '2fc08cfdd0a6a769b542af289acce07231464910',
        attributes: {
          name: 'Jerreed',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '5027f94a028494f8ac6e33f0b5cbc909a94a13f9',
        attributes: {
          name: 'John',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '2fc265eb45462d153cbf5401fa1783636ab1a8aa',
        attributes: {
          name: 'José Luis',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '8b40666afa3ff97ea2f593d9cbea3094450d837e',
        attributes: {
          name: 'Laura',
        },
      },
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptId: 'ebf658e7-e969-45c4-8a74-af3a2d653e55',
        _uid: '43d93f49167ebc142efa0aef127152ddad614c74',
        attributes: {
          name: 'John',
        },
      },
    ];

    const mockProtocolAttributes = {
      protocolAttribute: 33,
      overwriteInNode: 10,
      overwriteInStage: 50,
    };

    const mockStageAttributes = {
      myStageAttribute: 45,
      overwriteInStage: 55,
    };

    const action = actionCreators.batchAddNodes(
      mockNodeList,
      mockStageAttributes,
      mockProtocolAttributes,
    );

    const newState = reducer(
      {
        ...mockState,
      },
      action,
    );

    expect(newState.nodes).toHaveLength(8);

    // Contains stage attributes and default code attributes
    const newNode = newState.nodes[0];
    expect(newNode).toEqual(
      {
        type: 'ffcd1f42-3c9e-4e51-9a0e-305194a3e601',
        stageId: '0036b700-9050-11e9-8c88-ff1bcaf707d9',
        promptIDs: ['ebf658e7-e969-45c4-8a74-af3a2d653e55'],
        itemType: undefined,
        _uid: 'b868f61155ce8b570ae5f40337a6f64f5a72f199',
        attributes: {
          myStageAttribute: 45,
          protocolAttribute: 33,
          overwriteInNode: 15,
          overwriteInStage: 55,
          name: 'Jacqueline',
        },
      },
    );
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
    expect(newState.nodes[0]).toEqual({
      [PK]: '383a6119e94aa2a1b2e1a5e84b2936b753437a11', [entityAttributesProperty]: { name: 'foo' }, itemType: undefined, promptIDs: [undefined], stageId: undefined, type: undefined,
    });

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
      },
    )).toEqual(
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
      },
    )).toEqual(
      {
        ...mockState,
        edges: [{ ...edgeB.modelData, attributes: {} }, { ...edgeA.modelData, attributes: {} }],
      },
    );
  });

  it('should handle REMOVE_EDGE', () => {
    const edgeA = {
      [PK]: 123, from: 'foo', to: 'bar', type: 'friend', attributes: {},
    };
    const edgeB = {
      [PK]: 1234, from: 'asdf', to: 'qwerty', type: 'friend', attributes: {},
    };
    expect(reducer(
      { ...mockState, edges: [edgeA, edgeB] },
      { type: actionTypes.REMOVE_EDGE, edgeId: 123 },
    )).toEqual(
      {
        ...mockState,
        edges: [edgeB],
      },
    );
  });
});
