/* eslint-env jest */

import {
  asExportableNode,
  asWorkerAgentEdge,
  asWorkerAgentNode,
} from '../networkFormat';

import {
  entityPrimaryKeyProperty,
  nodeTypePropertyForWorker,
  primaryKeyPropertyForWorker,
} from '../../ducks/modules/network';

describe('asWorkerAgentNode', () => {
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
    expect(asWorkerAgentNode(nodeInNetwork, nodeTypeDefinition).userProp1).toEqual('userProp1value');
  });

  it('returns a unique ID for the node', () => {
    expect(asWorkerAgentNode(nodeInNetwork, nodeTypeDefinition)[primaryKeyPropertyForWorker]).toEqual('node1');
  });

  it('returns a type for the node', () => {
    expect(asWorkerAgentNode(nodeInNetwork, nodeTypeDefinition)[nodeTypePropertyForWorker]).toEqual('person');
  });

  it('does not contain other private attrs props', () => {
    expect(asWorkerAgentNode(nodeInNetwork, nodeTypeDefinition)).not.toHaveProperty('stageId');
  });

  it('allows pass-though props from external data', () => {
    const externalNode = { ...nodeInNetwork, attributes: { ...nodeInNetwork.attributes, unknownProp: 'foo' } };
    const node = asWorkerAgentNode(externalNode, nodeTypeDefinition);
    expect(node.unknownProp).toEqual('foo');
  });
});

describe('asWorkerAgentEdge', () => {
  const edgeInNetwork = {
    from: 'node1',
    to: 'node2',
    type: '1234',
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
    expect(asWorkerAgentEdge(edgeInNetwork, edgeTypeDefinition).type).toEqual('friend');
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
