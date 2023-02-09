const { AdjacencyMatrixFormatter } = require('../formatters/csv/matrix');
const { AttributeListFormatter } = require('../formatters/csv/attribute-list');
const { EgoListFormatter } = require('../formatters/csv/ego-list');
const { EdgeListFormatter } = require('../formatters/csv/edge-list');
const GraphMLFormatter = require('../formatters/graphml/GraphMLFormatter');

/**
 * Formatter factory
 * @param  {string} formatterType one of the `format`s
 * @return {class}
 */
const getFormatterClass = (formatterType) => {
  switch (formatterType) {
    case 'graphml':
      return GraphMLFormatter;
    case 'adjacencyMatrix':
      return AdjacencyMatrixFormatter;
    case 'edgeList':
      return EdgeListFormatter;
    case 'attributeList':
      return AttributeListFormatter;
    case 'ego':
      return EgoListFormatter;
    default:
      return null;
  }
};

module.exports = getFormatterClass;
