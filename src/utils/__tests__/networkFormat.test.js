/* eslint-env jest */

import {
  asWorkerAgentEdge,
  asWorkerAgentNode,
} from '../networkFormat';

import {
  nodePrimaryKeyProperty,
  nodeTypePropertyForWorker,
  primaryKeyPropertyForWorker,
} from '../../ducks/modules/network';

describe('asWorkerAgentNode', () => {
  const nodeInNetwork = {
    attributes: {
      1234: 'userProp1value',
    },
    [nodePrimaryKeyProperty]: 'node1',
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
