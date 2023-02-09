/* eslint-disable no-underscore-dangle */
const { includes, groupBy } = require('lodash');
const {
  entityPrimaryKeyProperty,
  entityAttributesProperty,
  sessionProperty,
  egoProperty,
  nodeExportIDProperty,
  edgeExportIDProperty,
  ncSourceUUID,
  ncTargetUUID,
  edgeSourceProperty,
  edgeTargetProperty,
  caseProperty,
  sessionFinishTimeProperty,
  sessionStartTimeProperty,
  sessionExportTimeProperty,
  protocolProperty,
  protocolName,
  codebookHashProperty,
} = require('@codaco/shared-consts');
const { getAttributePropertyFromCodebook } = require('./graphml/helpers');
const { getEntityAttributes } = require('../utils/general');

// Determine which variables to include
// TODO: Move this to CSV formatter, since only CSV uses it
const processEntityVariables = (entity, entityType, codebook, exportSettings) => ({
  ...entity,
  attributes: Object.keys(getEntityAttributes(entity)).reduce(
    (
      accumulatedAttributes,
      attributeUUID,
    ) => {
      const attributeName = getAttributePropertyFromCodebook(codebook, entityType, entity, attributeUUID, 'name');
      const attributeType = getAttributePropertyFromCodebook(codebook, entityType, entity, attributeUUID, 'type');
      const attributeData = getEntityAttributes(entity)[attributeUUID];

      if (attributeType === 'categorical') {
        const attributeOptions = getAttributePropertyFromCodebook(codebook, entityType, entity, attributeUUID, 'options') || [];
        const optionData = attributeOptions.reduce((accumulatedOptions, optionName) => (
          {
            ...accumulatedOptions,
            [`${attributeName}_${optionName.value}`]: !!attributeData && includes(attributeData, optionName.value),
          }
        ), {});
        return { ...accumulatedAttributes, ...optionData };
      }

      if (attributeType === 'layout') {
        // Process screenLayoutCoordinates option
        const xCoord = attributeData && attributeData.x;
        const yCoord = attributeData && attributeData.y;

        const {
          screenLayoutWidth,
          screenLayoutHeight,
          useScreenLayoutCoordinates,
        } = exportSettings;

        const screenSpaceAttributes = attributeData && useScreenLayoutCoordinates
          ? {
            [`${attributeName}_screenSpaceX`]: (attributeData.x * screenLayoutWidth).toFixed(2),
            [`${attributeName}_screenSpaceY`]: ((1.0 - attributeData.y) * screenLayoutHeight).toFixed(2),
          }
          : {};

        const layoutAttrs = {
          [`${attributeName}_x`]: xCoord,
          [`${attributeName}_y`]: yCoord,
          ...screenSpaceAttributes,
        };

        return { ...accumulatedAttributes, ...layoutAttrs };
      }

      if (attributeName) {
        return { ...accumulatedAttributes, [attributeName]: attributeData };
      }

      return { ...accumulatedAttributes, [attributeUUID]: attributeData };
    },
    {},
  ),
});

// Iterates a network, and adds an attribute to nodes and edges
// that references the ego ID that nominated it
const insertNetworkEgo = (session) => (
  {
    ...session,
    nodes: session.nodes.map((node) => (
      { [egoProperty]: session.ego[entityPrimaryKeyProperty], ...node }
    )),
    edges: session.edges.map((edge) => (
      { [egoProperty]: session.ego[entityPrimaryKeyProperty], ...edge }
    )),
  }
);

const insertEgoIntoSessionNetworks = (sessions) => (
  sessions.map((session) => insertNetworkEgo(session))
);

/**
 * Partition a network as needed for edge-list and adjacency-matrix formats.
 * Each network contains a reference to the original nodes, with a subset of edges
 * based on the type.
 *
 * @param  {Object} codebook
 * @param  {Array} session in NC format
 * @param  {string} format one of `formats`
 * @return {Array} An array of networks, partitioned by type. Each network object is decorated
 *                 with an additional `partitionEntity` prop to facilitate format naming.
 */
const partitionNetworkByType = (codebook, session, format) => {
  const getEntityName = (uuid, type) => codebook[type][uuid].name;

  switch (format) {
    case 'graphml':
    case 'ego': {
      return [session];
    }
    case 'attributeList': {
      if (!session.nodes.length) {
        return [session];
      }

      const partitionedNodeMap = session.nodes.reduce((nodeMap, node) => {
        nodeMap[node.type] = nodeMap[node.type] || []; // eslint-disable-line no-param-reassign
        nodeMap[node.type].push(node);
        return nodeMap;
      }, {});

      return Object.entries(partitionedNodeMap).map(([nodeType, nodes]) => ({
        ...session,
        nodes,
        partitionEntity: getEntityName(nodeType, 'node'),
      }));
    }
    case 'edgeList':
    case 'adjacencyMatrix': {
      if (!session.edges.length) {
        return [session];
      }

      const partitionedEdgeMap = session.edges.reduce((edgeMap, edge) => {
        edgeMap[edge.type] = edgeMap[edge.type] || []; // eslint-disable-line no-param-reassign
        edgeMap[edge.type].push(edge);
        return edgeMap;
      }, {});

      return Object.entries(partitionedEdgeMap).map(([edgeType, edges]) => ({
        ...session,
        edges,
        partitionEntity: getEntityName(edgeType, 'edge'),
      }));
    }
    default:
      throw new Error('Unexpected format', format);
  }
};

// Iterates sessions and adds an automatically incrementing counter to
// allow for human readable IDs
const resequenceIds = (sessions) => {
  const resequencedEntities = sessions.map((session) => {
    let resequencedNodeId = 0;
    let resequencedEdgeId = 0;
    const IDLookupMap = {}; // Create a lookup object { [oldID] -> [incrementedID] }

    return {
      ...session,
      nodes: session.nodes.map(
        (node) => {
          resequencedNodeId += 1;
          IDLookupMap[node[entityPrimaryKeyProperty]] = resequencedNodeId;
          return {
            [nodeExportIDProperty]: resequencedNodeId,
            ...node,
          };
        },
      ),
      edges: session.edges.map(
        (edge) => {
          resequencedEdgeId += 1;
          IDLookupMap[edge[entityPrimaryKeyProperty]] = resequencedEdgeId;
          return {
            ...edge,
            [ncSourceUUID]: edge[edgeSourceProperty],
            [ncTargetUUID]: edge[edgeTargetProperty],
            [edgeExportIDProperty]: resequencedEdgeId,
            from: IDLookupMap[edge[edgeSourceProperty]],
            to: IDLookupMap[edge[edgeTargetProperty]],
          };
        },
      ),
    };
  });

  return resequencedEntities;
};

// Result is a SINGLE session, with MULTIPLE ego and sessionVariables
// We add the sessionID to each entity so that we can groupBy on it within
// the exporter to reconstruct the sessions.
const unionOfNetworks = (sessionsByProtocol) => Object.keys(sessionsByProtocol)
  .reduce((sessions, protocolUID) => {
    const protocolSessions = sessionsByProtocol[protocolUID]
      .reduce((union, session) => ({
        // Merge node list when union option is selected
        nodes: [...union.nodes, ...session.nodes.map((node) => ({
          ...node,
          [sessionProperty]: session.sessionVariables[sessionProperty],
        }))],
        edges: [...union.edges, ...session.edges.map((edge) => ({
          ...edge,
          [sessionProperty]: session.sessionVariables[sessionProperty],
        }))],
        ego: {
          ...union.ego,
          [session.sessionVariables[sessionProperty]]: session.ego,
        },
        sessionVariables: {
          ...union.sessionVariables,
          [session.sessionVariables[sessionProperty]]: session.sessionVariables,
        },
      }), {
        nodes: [], edges: [], ego: {}, sessionVariables: {},
      });
    return {
      ...sessions,
      [protocolUID]: Array(protocolSessions),
    };
  }, {});

// Function designed to mirror the flow in FileExportManager.exportSessions()
const processMockNetworks = (networkCollection, unify) => {
  const sessionsWithEgo = insertEgoIntoSessionNetworks(networkCollection);
  const sessionsWithResequencedIDs = resequenceIds(sessionsWithEgo);
  const sessionsByProtocol = groupBy(sessionsWithResequencedIDs, `sessionVariables.${protocolProperty}`);

  if (!unify) {
    return sessionsByProtocol;
  }
  return unionOfNetworks(sessionsByProtocol);
};

const mockNetwork = {
  nodes: [
    {
      [entityPrimaryKeyProperty]: '1',
      type: 'mock-node-type',
      [entityAttributesProperty]: {
        'mock-uuid-1': 'Dee', 'mock-uuid-2': 40, 'mock-uuid-3': { x: 0, y: 0 }, 'mock-uuid-4': true, 'mock-uuid-5': null,
      },
    },
    {
      [entityPrimaryKeyProperty]: '2',
      type: 'mock-node-type',
      [entityAttributesProperty]: {
        'mock-uuid-1': 'Carl', 'mock-uuid-2': 0, 'mock-uuid-3': { x: 0, y: 0 }, 'mock-uuid-4': false, 'mock-uuid-5': null,
      },
    },
    {
      [entityPrimaryKeyProperty]: '3',
      type: 'mock-node-type',
      [entityAttributesProperty]: {
        'mock-uuid-1': 'Jumbo', 'mock-uuid-2': 50, 'mock-uuid-3': null, 'mock-uuid-4': true, 'mock-uuid-5': null,
      },
    },
    {
      [entityPrimaryKeyProperty]: '4',
      type: 'mock-node-type',
      [entityAttributesProperty]: {
        'mock-uuid-1': 'Francis', 'mock-uuid-2': 10, 'mock-uuid-3': { x: 0, y: 0 }, 'mock-uuid-4': null, 'mock-uuid-5': null,
      },
    },
  ],
  edges: [
    { from: '1', to: '2', type: 'mock-edge-type' },
  ],
  ego: {
    [entityPrimaryKeyProperty]: 'ego-id-1',
    [entityAttributesProperty]: {
      'mock-uuid-1': 'Dee',
      'mock-uuid-2': 40,
      'mock-uuid-3': false,
    },
  },
  sessionVariables: {
    [caseProperty]: 123,
    [protocolName]: 'protocol name',
    [protocolProperty]: 'protocol-uid-1',
    [sessionProperty]: 'session-id-1',
    [sessionStartTimeProperty]: 100,
    [sessionFinishTimeProperty]: 200,
    [sessionExportTimeProperty]: 300,
    [codebookHashProperty]: '14fa461bf4b98155e82adc86532938553b4d33a9',
  },
};

const mockNetwork2 = {
  nodes: [
    { [entityPrimaryKeyProperty]: '10', type: 'mock-node-type', [entityAttributesProperty]: { 'mock-uuid-1': 'Jimbo', 'mock-uuid-2': 20, 'mock-uuid-3': { x: 10, y: 50 } } },
    { [entityPrimaryKeyProperty]: '20', type: 'mock-node-type', [entityAttributesProperty]: { 'mock-uuid-1': 'Jambo', 'mock-uuid-2': 30, 'mock-uuid-3': { x: 20, y: 20 } } },
  ],
  edges: [
    { from: '10', to: '20', type: 'mock-edge-type' },
  ],
  ego: {
    [entityPrimaryKeyProperty]: 'ego-id-10',
    [entityAttributesProperty]: {
      'mock-uuid-1': 'Dee',
      'mock-uuid-2': 40,
      'mock-uuid-3': true,
    },
  },
  sessionVariables: {
    [caseProperty]: 456,
    [protocolName]: 'protocol name',
    [protocolProperty]: 'protocol-uid-1',
    [sessionProperty]: 'session-id-2',
    [sessionStartTimeProperty]: 1000,
    [sessionFinishTimeProperty]: 2000,
    [sessionExportTimeProperty]: 3000,
    [codebookHashProperty]: '14fa461bf4b98155e82adc86532938553b4d33a9',
  },
};

const mockCodebook = {
  ego: {
    variables: {
      'mock-uuid-1': { name: 'egoName', type: 'string' },
      'mock-uuid-2': { name: 'egoAge', type: 'number' },
      'mock-uuid-3': { name: 'boolVar', type: 'boolean' },
    },
  },
  node: {
    'mock-node-type': {
      name: 'person',
      variables: {
        'mock-uuid-1': { name: 'firstName', type: 'string' },
        'mock-uuid-2': { name: 'age', type: 'number' },
        'mock-uuid-3': { name: 'layout', type: 'layout' },
        'mock-uuid-4': { name: 'boolWithValues', type: 'boolean' },
        'mock-uuid-5': { name: 'nullBool', type: 'boolean' },
        'mock-uuid-6': { name: 'unusedBool', type: 'boolean' },
      },
    },
  },
  edge: {
    'mock-edge-type': {
      name: 'peer',
    },
    'mock-edge-type-2': {
      name: 'likes',
    },
  },
};

module.exports = {
  mockCodebook,
  mockNetwork,
  mockNetwork2,
  processEntityVariables,
  insertNetworkEgo,
  insertEgoIntoSessionNetworks,
  partitionNetworkByType,
  resequenceIds,
  unionOfNetworks,
  processMockNetworks,
};
