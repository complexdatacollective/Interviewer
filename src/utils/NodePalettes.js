const NodePalettes = {
  default: 'node-base',
  person: 'node-base',
  venue: 'node-alt-1',
  relationship: 'node-alt-2',
};

/**
 * @function getNodePalette
 *
 * @param nodeType {string} The type of the Node (e.g., 'person')
 * @return {string} palette name that can be used as a modifier for styling
 *
 */
export const getNodePalette = nodeType => (
  NodePalettes[nodeType] || NodePalettes.default
);

export default NodePalettes;
