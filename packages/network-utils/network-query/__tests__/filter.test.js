/* eslint-env jest */
const getFilter = require('../filter').default;
const { entityAttributesProperty } = require('@codaco/shared-consts');
const { operators } = require('../predicate');
const { getEntityGenerator, generateRuleConfig } = require('./helpers');

const generateEntity = getEntityGenerator();

const network = {
  nodes: [
    generateEntity({ name: 'William', age: 19, favoriteColor: 'green', likesFish: true }),
    generateEntity({ name: 'Theodore', age: 18, favoriteColor: 'red', likesFish: false }),
    generateEntity({ name: 'Rufus', age: 51, favoriteColor: 'red', likesFish: null }),
    generateEntity({ name: 'Phone Box' }, null, 'node', 'publicUtility'),
  ],
  edges: [
    generateEntity({ booleanVariable: true }, { from: 1, to: 2 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: true }, { from: 2, to: 3 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: false }, { from: 1, to: 3 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: false }, { from: 1, to: 2 }, 'edge', 'band'),
  ],
};

const network2 = {
  nodes: [
    generateEntity({ name: 'Person 1', is_Person: true, is_Organization: null }, null, 'node', 'person'),
    generateEntity({ name: 'Person 2', is_Person: true, is_Organization: null }, null, 'node', 'person'),
    generateEntity({ name: 'Org 1', is_Person: null, is_Organization: true }, null, 'node', 'person'),
    generateEntity({ name: 'Org 2', is_Person: null, is_Organization: true }, null, 'node', 'person'),
  ],
  edges: [
    generateEntity({}, { from: 5, to: 6 }, 'edge', 'friend'),
    generateEntity({}, { from: 6, to: 7 }, 'edge', 'helps'),
    // generateEntity({}, { from: 7, to: 8 }, 'edge', 'helps'),
  ],
};

describe('filter', () => {
  describe('single rule', () => {
    it('nodes match the rule', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: operators.LESS_THAN,
            attribute: 'age',
            value: 20,
          }),
        ],
        join: 'OR',
      };

      const filter = getFilter(filterConfig);
      const result = filter(network);
      expect(result.nodes.length).toEqual(2);
    });
  });

  describe('Boolean edge cases', () => {
    it('"exactly" operator excludes null values', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: operators.EXACTLY,
            attribute: 'likesFish',
            value: false,
          }),
        ],
        join: 'OR',
      };

      const filter = getFilter(filterConfig);
      const { nodes, edges } = filter(network);
      const names = nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['Theodore']);
      expect(edges.length).toEqual(0);

      const filterConfig2 = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: operators.EXACTLY,
            attribute: 'likesFish',
            value: true,
          }),
        ],
        join: 'OR',
      };

      const filter2 = getFilter(filterConfig2);
      const result2 = filter2(network);
      expect(result2.nodes.length).toEqual(1);
    });
  });

  describe('OR', () => {
    const filterConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: operators.LESS_THAN,
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('alter', {
          type: 'publicUtility',
          operator: operators.EXISTS,
        }),
      ],
      join: 'OR',
    };

    it('matches are combined', () => {
      const filter = getFilter(filterConfig);
      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['William', 'Theodore', 'Phone Box']);
      expect(result.edges.length).toEqual(2);
    });

    it('orphaned edges are removed', () => {
      const filter = getFilter(filterConfig);
      const result = filter(network);
      expect(result.edges.length).toEqual(2);
    });

    it('does not include duplicates', () => {
      // This filter matches the same two nodes for both rules.
      const filterConfig2 = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: operators.LESS_THAN,
            attribute: 'age',
            value: 60,
          }),
          generateRuleConfig('alter', {
            type: 'person',
            operator: operators.EXACTLY,
            attribute: 'favoriteColor',
            value: 'red',
          }),
        ],
        join: 'OR',
      };

      const filter = getFilter(filterConfig2);
      const result = filter(network);
      expect(result.nodes.length).toEqual(3);
    });
  });

  describe('AND', () => {
    const filterConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: operators.LESS_THAN,
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('alter', {
          type: 'person',
          operator: operators.EXACTLY,
          attribute: 'favoriteColor',
          value: 'red',
        }),
      ],
      join: 'AND',
    };

    const filter = getFilter(filterConfig);

    it('matches are refined', () => {
      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['Theodore']);
      expect(result.edges.length).toEqual(0);
    });

    it('orphaned edges are removed', () => {
      const result = filter(network);
      expect(result.edges.length).toEqual(0);
    });
  });

  describe('Edges', () => {
    it('can filter edges by type', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('edge', {
            type: 'friend',
            operator: operators.EXISTS,
          }),
        ],
      };

      const filter = getFilter(filterConfig);

      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['William', 'Theodore', 'Rufus']);
      expect(result.edges.length).toEqual(3);
    });

    it.todo('can filter edges by type (not)');

    it('can filter edges by attribute', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('edge', {
            type: 'friend',
            operator: operators.EXACTLY,
            attribute: 'booleanVariable',
            value: true,
          }),
        ],
      };

      const filter = getFilter(filterConfig);

      const result = filter(network);
      expect(result.edges.length).toEqual(2);
    });
  });
});

describe('Edge cases', () => {
  it('Includes edges between nodes that match separate rules', () => {
    const filterConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: operators.EXACTLY,
          attribute: 'is_Person',
          value: true,
        }),
        generateRuleConfig('alter', {
          type: 'person',
          operator: operators.EXACTLY,
          attribute: 'is_Organization',
          value: true,
        }),
      ],
      join: 'OR',
    };

    const filter = getFilter(filterConfig);

    const result = filter(network2);
    const names = result.nodes.map(node => node[entityAttributesProperty].name);
    expect(names).toEqual(['Person 1', 'Person 2', 'Org 1', 'Org 2']);
    expect(result.edges.length).toEqual(2);
  });

  it.todo('Handles rule order without changing the result');
});
