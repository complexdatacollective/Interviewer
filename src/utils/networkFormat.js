import {
  getNodeAttributes,
  nodeAttributesProperty,
  nodePrimaryKeyProperty,
  nodeTypePropertyForWorker,
  primaryKeyPropertyForWorker,
} from '../ducks/modules/network';

/**
 * Internally, 'attributes' are stored with UUID keys, which are meaningless to the end user.
 * This resolves those UUIDs to variable names based on the definitions in the variable registry,
 * appropriate for user scripts and export.
 * @private
 */
const getNodeAttributesWithNamesResolved = (node, nodeVariableDefs) => {
  if (!nodeVariableDefs) {
    return {};
  }
  const attrs = getNodeAttributes(node);
  return Object.keys(attrs).reduce((acc, uuid) => {
    if (nodeVariableDefs[uuid] && nodeVariableDefs[uuid].name) {
      acc[nodeVariableDefs[uuid].name] = attrs[uuid];
    }
    return acc;
  }, {});
};

/**
 * Given a variable name ("age") and the relevant section of the variable registry, returns the
 * ID/key for that name.
 */
const getVariableIdFromName = (variableName, variableDefs) => {
  const entry = Object.entries(variableDefs).find(([, variable]) => variable.name === variableName);
  return entry && entry[0];
};

/**
 * The inverse of getNodeAttributesWithNamesResolved
 */
export const getNodeWithIdAttributes = (node, nodeVariableDefs) => {
  if (!nodeVariableDefs) {
    return {};
  }
  const attrs = getNodeAttributes(node);
  const mappedAttrs = Object.keys(attrs).reduce((acc, varName) => {
    const variableId = getVariableIdFromName(varName, nodeVariableDefs);
    if (variableId) {
      acc[variableId] = attrs[varName];
    }
    return acc;
  }, {});

  return {
    ...node,
    [nodeAttributesProperty]: mappedAttrs,
  };
};

export const asExportableNode = (node, nodeTypeDefinition) => ({
  ...node,
  attributes: getNodeAttributesWithNamesResolved(node, (nodeTypeDefinition || {}).variables),
});

export const asExportableEdge = (edge, edgeTypeDefinition) => ({
  ...edge,
  type: edgeTypeDefinition && edgeTypeDefinition.name,
});

/**
 * Produces a network suitable for export.
 * In particular, transposes variable IDs to names.
 * Also available as a memoized selector; see selectors/interface.
 *
 * @param  {Object} network  the entire network (in redux state)
 * @param  {Object} registry the variableRegistry from a protocol
 * @return {Object} externalNetwork
 */
export const asExportableNetwork = (network = {}, registry = {}) => {
  const { nodes = [], edges = [] } = network;
  const { node: nodeRegistry = {}, edge: edgeRegistry = {} } = registry;
  return ({
    nodes: nodes.map(node => asExportableNode(node, nodeRegistry[node.type])),
    edges: edges.map(edge => asExportableEdge(edge, edgeRegistry[edge.type])),
  });
};

/**
 * Contains all user attributes flattened with the node's unique ID & type.
 *
 *`primaryKeyPropertyForWorker` and `nodeTypePropertyForWorker` are used to minimize conflicts,
 * but user data is always preserved in the event of conflicts.
 *
 * @param  {Object} node
 * @param  {Object} nodeTypeDefinition The variableRegistry entry for this node type
 * @return {Object} node data safe to supply to user-defined workers.
 */
export const asWorkerAgentNode = (node, nodeTypeDefinition) => ({
  [primaryKeyPropertyForWorker]: node[nodePrimaryKeyProperty],
  [nodeTypePropertyForWorker]: nodeTypeDefinition && nodeTypeDefinition.name,
  ...getNodeAttributesWithNamesResolved(node, (nodeTypeDefinition || {}).variables),
});

export const asWorkerAgentEdge = asExportableEdge;

/**
 * Produces a network suitable for worker scripts.
 *
 * @param  {Object} network  the entire network (in redux state)
 * @param  {Object} registry the variableRegistry from a protocol
 * @return {Object} workerNetwork
 */
export const asWorkerAgentNetwork = (network = {}, registry = {}) => {
  const { nodes = [], edges = [] } = network;
  const { node: nodeRegistry = {}, edge: edgeRegistry = {} } = registry;
  return ({
    nodes: nodes.map(node => asWorkerAgentNode(node, nodeRegistry[node.type])),
    edges: edges.map(edge => asWorkerAgentEdge(edge, edgeRegistry[edge.type])),
  });
};
