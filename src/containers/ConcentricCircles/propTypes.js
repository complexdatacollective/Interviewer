import PropTypes from 'prop-types';

export default {
  layoutVariable: PropTypes.string.isRequired,
  allowPositioning: PropTypes.bool.isRequired,
  createEdge: PropTypes.string,
  displayEdges: PropTypes.array.isRequired,
  canCreateEdge: PropTypes.bool.isRequired,
  allowHighlighting: PropTypes.bool.isRequired,
  highlightAttributes: PropTypes.object,
  nodeBinSortOrder: PropTypes.array.isRequired,
};
