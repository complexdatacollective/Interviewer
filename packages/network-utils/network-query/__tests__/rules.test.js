/* eslint-env jest */
const { entityAttributesProperty } = require('@codaco/shared-consts');
const getRule = require('../rules').default;
const { getEntityGenerator, generateRuleConfig } = require('./helpers');

const generateEntity = getEntityGenerator();

const mockNodes = [
  generateEntity({ name: 'William', age: 19, categoricalNull: null }),
  generateEntity({ name: 'Theodore', age: 18, categoricalNull: null }),
  generateEntity({ name: 'Rufus', age: 51, categoricalNull: null }),
  generateEntity({ name: 'Phone Box' }, null, 'node', 'public_utility'),
  generateEntity({ name: 'Pillar Box' }, null, 'node', 'public_utility'),
];

const mockEdges = [
  generateEntity({ stringVariable: 'string', booleanVariable: true, numberVariable: 6 }, { from: 1, to: 2 }, 'edge', 'friend'),
  generateEntity({ stringVariable: 'not', booleanVariable: false, numberVariable: 4 }, { from: 2, to: 3 }, 'edge', 'friend'),
  generateEntity({}, { from: 2, to: 3 }, 'edge', 'electrical'),
  generateEntity({}, { from: 4, to: 5 }, 'edge', 'electrical'),
];

const mockNetwork = {
  nodes: mockNodes,
  edges: mockEdges,
};

const getMatchedNames = matches => matches.map(node => node[entityAttributesProperty].name);

const runRuleHelper = (ruleConfig) => {
  const rule = getRule(ruleConfig);
  const results = rule(mockNetwork.nodes, mockNetwork.edges);
  const {
    nodes,
    edges,
  } = results;

  return {
    nodes,
    edges,
    results,
    nodeNames: getMatchedNames(nodes),
  };
};

describe('rules', () => {
  it('getRule() returns a function', () => {
    const rule = getRule({});

    expect(typeof rule).toEqual('function');
  });


  describe('alter rules', () => {
    describe('faulty rules', () => {
      it('correctly handles missing attribute (EXACTLY)', () => {
        const ruleConfig = generateRuleConfig(
          'alter',
          {
            type: 'person',
            attribute: 'missingVariable',
            operator: 'EXACTLY',
            value: 19,
          },
        );

        const {
          nodes,
        } = runRuleHelper(ruleConfig);

        expect(nodes.length).toEqual(0);
      });

      it('correctly handles missing attribute (NOT)', () => {
        const ruleConfig = generateRuleConfig(
          'alter',
          {
            type: 'person',
            attribute: 'missingVariable',
            operator: 'NOT',
            value: 19,
          },
        );

        const {
          nodes,
        } = runRuleHelper(ruleConfig);

        expect(nodes.length).toEqual(3);
      });

      it('correctly handles false-like categorical attribute (INCLUDES)', () => {
        const ruleConfig = generateRuleConfig(
          'alter',
          {
            type: 'person',
            attribute: 'categoricalNull',
            operator: 'INCLUDES',
            value: [19],
          },
        );

        const {
          nodes,
        } = runRuleHelper(ruleConfig);

        expect(nodes.length).toEqual(0);
      });

      it('correctly handles false-like categorical attribute (EXCLUDES)', () => {
        const ruleConfig = generateRuleConfig(
          'alter',
          {
            type: 'person',
            attribute: 'categoricalNull',
            operator: 'EXCLUDES',
            value: [19],
          },
        );

        const {
          nodes,
        } = runRuleHelper(ruleConfig);

        expect(nodes.length).toEqual(3);
      });
    });

    describe('type rules', () => {
      it('EXISTS', () => {
        const ruleConfig = generateRuleConfig('alter', { type: 'person', operator: 'EXISTS' });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Theodore', 'Rufus']);
        expect(edges.length).toEqual(3);
      });

      it('NOT_EXISTS', () => {
        const ruleConfig = generateRuleConfig('alter', { type: 'person', operator: 'NOT_EXISTS' });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Phone Box', 'Pillar Box']);
        expect(edges.length).toEqual(1);
      });
    });

    describe('attribute rules', () => {
      const generateAttributeRuleConfig = config =>
        generateRuleConfig(
          'alter',
          {
            type: 'person',
            operator: 'EXACTLY',
            attribute: 'name',
            value: 'William',
            ...config,
          },
        );

      it('EXACTLY', () => {
        const ruleConfig = generateAttributeRuleConfig({ operator: 'EXACTLY' });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William']);
        expect(edges.length).toEqual(0);
      });

      it('NOT', () => {
        const ruleConfig = generateAttributeRuleConfig({ operator: 'NOT' });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Theodore', 'Rufus']);
        expect(edges.length).toEqual(2);
      });

      it('GREATER_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'GREATER_THAN',
          value: 19,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Rufus']);
        expect(edges.length).toEqual(0);
      });

      it('LESS_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'LESS_THAN',
          value: 19,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Theodore']);
        expect(edges.length).toEqual(0);
      });

      it('GREATER_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 19,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Rufus']);
        expect(edges.length).toEqual(0);
      });

      it('LESS_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'LESS_THAN_OR_EQUAL',
          value: 19,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Theodore']);
        expect(edges.length).toEqual(1);
      });
    });
  });

  describe('edge rules', () => {
    it('EXISTS', () => {
      const ruleConfig = generateRuleConfig('edge', { type: 'friend', operator: 'EXISTS' });

      const {
        nodeNames,
        edges,
      } = runRuleHelper(ruleConfig);

      expect(nodeNames).toEqual(['William', 'Theodore', 'Rufus']);
      expect(edges.length).toEqual(2);
    });

    it('NOT_EXISTS', () => {
      const ruleConfig = generateRuleConfig('edge', { type: 'friend', operator: 'NOT_EXISTS' });

      const {
        nodeNames,
        edges,
      } = runRuleHelper(ruleConfig);
      expect(nodeNames).toEqual(['Theodore', 'Rufus', 'Phone Box', 'Pillar Box']);
      expect(edges.length).toEqual(2);
    });

    describe('attribute rules', () => {
      const generateAttributeRuleConfig = config =>
        generateRuleConfig(
          'edge',
          {
            type: 'friend',
            ...config,
          },
        );

      it('EXACTLY', () => {
        const ruleConfig = generateAttributeRuleConfig({
          operator: 'EXACTLY',
          attribute: 'stringVariable',
          value: 'string',
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Theodore']);
        expect(edges.length).toEqual(1);
      });

      it('NOT', () => {
        const ruleConfig = generateAttributeRuleConfig({
          operator: 'NOT',
          attribute: 'stringVariable',
          value: 'string',
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Theodore', 'Rufus']);
        expect(edges.length).toEqual(1);
      });

      it('GREATER_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'numberVariable',
          operator: 'GREATER_THAN',
          value: 5,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Theodore']);
        expect(edges.length).toEqual(1);
      });

      it('LESS_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'numberVariable',
          operator: 'LESS_THAN',
          value: 5,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Theodore', 'Rufus']);
        expect(edges.length).toEqual(1);
      });

      it('GREATER_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'numberVariable',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 5,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['William', 'Theodore']);
        expect(edges.length).toEqual(1);
      });

      it('LESS_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'numberVariable',
          operator: 'LESS_THAN_OR_EQUAL',
          value: 5,
        });

        const {
          nodeNames,
          edges,
        } = runRuleHelper(ruleConfig);

        expect(nodeNames).toEqual(['Theodore', 'Rufus']);
        expect(edges.length).toEqual(1);
      });
    });
  });
});
