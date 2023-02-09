/* eslint-env jest */
const {
  egoProperty,
  entityAttributesProperty,
  entityPrimaryKeyProperty,
  sessionProperty,
} = require('@codaco/shared-consts');
const {
  unionOfNetworks,
  insertEgoIntoSessionNetworks,
} = require('../network');
const { getEntityAttributes } = require('../../utils/general');

const protocolID = 123;

// Utility method for use during testing.
// const randomFail = (passThrough) => new Promise((resolve, reject) => {
//   if (Math.random() >= 0.5) {
//     reject(new Error('Error happened!'));
//   }

//   resolve(passThrough);
// });

describe('network format helpers', () => {
  describe('unionOfNetworks', () => {
    it('joins nodes of two networks', () => {
      const a = { nodes: [{ id: 1 }], edges: [], sessionVariables: { [sessionProperty]: 456 } };
      const b = { nodes: [{ id: 2 }], edges: [], sessionVariables: { [sessionProperty]: 789 } };
      const sessionsByProtocol = {
        [protocolID]: [a, b],
      };

      const unionSession = unionOfNetworks(sessionsByProtocol)[protocolID][0];

      expect(unionSession.nodes).toEqual([
        { id: 1, [sessionProperty]: 456 }, { id: 2, [sessionProperty]: 789 },
      ]);
    });

    it('joins edges of two networks', () => {
      const a = { nodes: [], edges: [{ id: 1 }], sessionVariables: { [sessionProperty]: 456 } };
      const b = { nodes: [], edges: [{ id: 2 }], sessionVariables: { [sessionProperty]: 789 } };

      const sessionsByProtocol = {
        [protocolID]: [a, b],
      };

      const unionSession = unionOfNetworks(sessionsByProtocol)[protocolID][0];

      expect(unionSession.edges).toEqual([
        { id: 1, [sessionProperty]: 456 }, { id: 2, [sessionProperty]: 789 },
      ]);
    });

    it('joins egos of two networks', () => {
      const a = {
        nodes: [],
        edges: [],
        ego: { id: 1 },
        sessionVariables: { [sessionProperty]: 456 },
      };
      const b = {
        nodes: [],
        edges: [],
        ego: { id: 2 },
        sessionVariables: { [sessionProperty]: 789 },
      };

      const sessionsByProtocol = {
        [protocolID]: [a, b],
      };

      const unionSession = unionOfNetworks(sessionsByProtocol)[protocolID][0];

      expect(unionSession.ego).toEqual(
        { 456: { id: 1 }, 789: { id: 2 } },
      );
    });
  });

  describe('insertEgoIntoSessionNetworks', () => {
    it('inserts ego uid in node objects', () => {
      const a = {
        nodes: [{ id: 1 }, { id: 2 }],
        edges: [],
        ego: { [entityPrimaryKeyProperty]: 1 },
      };
      const b = { nodes: [{ id: a }], edges: [], ego: { [entityPrimaryKeyProperty]: 2 } };
      const egoNetworks = insertEgoIntoSessionNetworks([a, b]);
      expect(egoNetworks[0].nodes).toEqual([{
        [egoProperty]: 1,
        id: 1,
      }, {
        [egoProperty]: 1,
        id: 2,
      }]);
      expect(egoNetworks[1].nodes).toEqual([{ [egoProperty]: 2, id: a }]);
    });

    it('inserts ego uid in edge objects', () => {
      const a = {
        nodes: [],
        edges: [{ id: 1 }, { id: 2 }],
        ego: { [entityPrimaryKeyProperty]: 1 },
      };
      const b = { nodes: [], edges: [{ id: a }], ego: { [entityPrimaryKeyProperty]: 2 } };
      const egoNetworks = insertEgoIntoSessionNetworks([a, b]);
      expect(egoNetworks[0].edges).toEqual([{
        [egoProperty]: 1,
        id: 1,
      }, {
        [egoProperty]: 1,
        id: 2,
      }]);
      expect(egoNetworks[1].edges).toEqual([{ [egoProperty]: 2, id: a }]);
    });
  });

  describe('getEntityAttributes', () => {
    it('gets nested attributes', () => {
      const node = { id: 1, [entityAttributesProperty]: { attr: 1 } };
      expect(getEntityAttributes(node)).toEqual({ attr: 1 });
    });
  });
});
