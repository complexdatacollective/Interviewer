/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import {
  asExportableNode,
  asWorkerAgentEntity,
  asWorkerAgentEdge,
  asExportableEgo,
  asExportableEdge,
} from '../networkFormat';

import {
  entityPrimaryKeyProperty,
  nodeTypePropertyForWorker,
  primaryKeyPropertyForWorker,
} from '../../ducks/modules/network';

describe('asWorkerAgentEntity', () => {
  const nodeInNetwork = {
    attributes: {
      1234: 'userProp1value',
    },
    [entityPrimaryKeyProperty]: 'node1',
    stageId: 42,
  };

  const nodeTypeDefinition = {
    name: 'person',
    variables: {
      1234: { name: 'userProp1' },
    },
  };

  it('returns a node’s attributes', () => {
    expect(asWorkerAgentEntity(nodeInNetwork, nodeTypeDefinition).userProp1).toEqual('userProp1value');
  });

  it('returns a unique ID for the node', () => {
    expect(asWorkerAgentEntity(nodeInNetwork, nodeTypeDefinition)[primaryKeyPropertyForWorker]).toEqual('node1');
  });

  it('returns a type for the node', () => {
    expect(asWorkerAgentEntity(nodeInNetwork, nodeTypeDefinition)[nodeTypePropertyForWorker]).toEqual('person');
  });

  it('does not contain other private attrs props', () => {
    expect(asWorkerAgentEntity(nodeInNetwork, nodeTypeDefinition)).not.toHaveProperty('stageId');
  });

  it('allows pass-though props from external data', () => {
    const externalNode = { ...nodeInNetwork, attributes: { ...nodeInNetwork.attributes, unknownProp: 'foo' } };
    const node = asWorkerAgentEntity(externalNode, nodeTypeDefinition);
    expect(node.unknownProp).toEqual('foo');
  });
});

describe('asWorkerAgentEdge', () => {
  const edgeInNetwork = {
    from: 'node1',
    to: 'node2',
    type: '1234',
    [entityPrimaryKeyProperty]: 'edge1',
  };

  const edgeTypeDefinition = {
    name: 'friend',
  };

  it('returns node IDs', () => {
    const workerEdge = asWorkerAgentEdge(edgeInNetwork, edgeTypeDefinition);
    expect(workerEdge.from).toEqual(edgeInNetwork.from);
    expect(workerEdge.to).toEqual(edgeInNetwork.to);
  });

  it('returns a user-friendly edge type', () => {
    expect(asWorkerAgentEntity(edgeInNetwork, edgeTypeDefinition)[nodeTypePropertyForWorker]).toEqual('friend');
  });
});

describe('asExportableNode', () => {
  const nodeInNetwork = {
    attributes: {
      1234: 'userProp1value',
    },
    [entityPrimaryKeyProperty]: 'node1',
    stageId: 42,
  };

  const nodeTypeDefinition = {
    name: 'person',
    variables: {
      1234: { name: 'userProp1' },
    },
  };

  it('transposes type and attributes', () => {
    const exportNode = asExportableNode(nodeInNetwork, nodeTypeDefinition);
    expect(exportNode.attributes.userProp1).toEqual('userProp1value');
    expect(exportNode.type).toEqual('person');
  });
});

describe('asExportableEdge', () => {
  const edgeInNetwork = {
    from: 'node1',
    to: 'node2',
    type: '1234',
    [entityPrimaryKeyProperty]: 'edge1',
    attributes: {
      1234: 'userProp1value',
    },
  };

  const edgeTypeDefinition = {
    name: 'friend',
    variables: {
      1234: { name: 'userProp1' },
    },
  };

  it('transposes type and attributes', () => {
    const exportEdge = asExportableEdge(edgeInNetwork, edgeTypeDefinition);
    expect(exportEdge.attributes.userProp1).toEqual('userProp1value');
    expect(exportEdge.type).toEqual('friend');
  });
});

describe('asExportableEgo', () => {
  const egoInNetwork = {
    attributes: {
      1234: 'userProp1value',
    },
  };

  const egoTypeDefinition = {
    variables: {
      1234: { name: 'userProp1' },
    },
  };

  it('transposes type and attributes', () => {
    const exportEgo = asExportableEgo(egoInNetwork, egoTypeDefinition);
    expect(exportEgo.attributes.userProp1).toEqual('userProp1value');
  });
});
