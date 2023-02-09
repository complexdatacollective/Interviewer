/* eslint-env jest */
const { entityPrimaryKeyProperty } = require('@codaco/shared-consts');
const GraphMLFormatter = require('../graphml/GraphMLFormatter');
const {
  partitionNetworkByType, mockCodebook,
} = require('../network');
const getFormatterClass = require('../../utils/getFormatterClass');
const { SUPPORTED_FORMATS } = require('../../consts/export-consts');

describe('formatter utilities', () => {
  describe('getFormatterClass', () => {
    it('maps graphml to its formatter', () => {
      expect(getFormatterClass('graphml')).toEqual(GraphMLFormatter);
    });

    it('maps each format to a class', () => {
      Object.keys(SUPPORTED_FORMATS).forEach((format) => {
        expect(getFormatterClass(format)).toBeDefined();
      });
    });
  });

  describe('partitionNetworkByType', () => {
    const alice = { [entityPrimaryKeyProperty]: 'a' };
    const bob = { [entityPrimaryKeyProperty]: 'b' };
    const carla = { [entityPrimaryKeyProperty]: 'c' };
    let nodes;
    let network;
    beforeEach(() => {
      nodes = [alice, bob, carla];
      network = {
        nodes,
        edges: [{ from: 'a', to: 'b', type: 'mock-edge-type' }, { from: 'a', to: 'b', type: 'mock-edge-type-2' }],
      };
    });

    it('partitions edges for matrix output', () => {
      const partitioned = partitionNetworkByType(mockCodebook, network, 'adjacencyMatrix');
      expect(partitioned[0].edges).toEqual([network.edges[0]]);
      expect(partitioned[1].edges).toEqual([network.edges[1]]);
    });

    it('partitions edges for edge list output', () => {
      const partitioned = partitionNetworkByType(mockCodebook, network, 'edgeList');
      expect(partitioned[0].edges).toEqual([network.edges[0]]);
      expect(partitioned[1].edges).toEqual([network.edges[1]]);
    });

    it('does not partition for other types', () => {
      expect(partitionNetworkByType(mockCodebook, network, 'graphml')).toHaveLength(1);
      expect(partitionNetworkByType(mockCodebook, network, 'ego')).toHaveLength(1);
    });

    it('decorates with an partitionEntity prop', () => {
      const partitioned = partitionNetworkByType(mockCodebook, network, 'adjacencyMatrix');
      expect(partitioned[0].partitionEntity).toEqual('peer');
      expect(partitioned[1].partitionEntity).toEqual('likes');
    });

    it('maintains a reference to nodes (without copying or modifying)', () => {
      // This is important to keep memory use low on large networks
      const partitioned = partitionNetworkByType(mockCodebook, network, 'adjacencyMatrix');
      expect(partitioned[0].nodes).toBe(nodes);
      expect(partitioned[1].nodes).toBe(nodes);
    });

    it('returns at least 1 network, even when no edges', () => {
      const partitioned = partitionNetworkByType(mockCodebook, { nodes, edges: [] }, 'adjacencyMatrix');
      expect(partitioned).toHaveLength(1);
      expect(partitioned[0].nodes).toBe(nodes);
    });
  });
});
