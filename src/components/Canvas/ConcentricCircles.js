import React from 'react';
import PropTypes from 'prop-types';
import Canvas from './Canvas';
import NodeBucket from '../../containers/Canvas/NodeBucket';
import NodeLayout from '../../containers/Canvas/NodeLayout';
import EdgeLayout from '../../containers/Canvas/EdgeLayout';
import Background from '../../containers/Canvas/Background';

const ConcentricCircles = ({
  subject,
  layoutVariable,
  highlight,
  allowHighlight,
  createEdge,
  allowPositioning,
  displayEdges,
  backgroundImage,
  concentricCircles,
  skewedTowardCenter,
  sortOrder,
  connectFrom,
  updateLinkFrom,
}) => (
  <Canvas className="concentric-circles">
    <Background
      concentricCircles={concentricCircles}
      skewedTowardCenter={skewedTowardCenter}
      image={backgroundImage}
    />
    {
      displayEdges.length > 0 &&
      <EdgeLayout
        displayEdges={displayEdges}
        subject={subject}
        layout={layoutVariable}
      />
    }
    <NodeLayout
      id="NODE_LAYOUT"
      highlight={highlight}
      allowHighlight={allowHighlight && !createEdge}
      createEdge={createEdge}
      layout={layoutVariable}
      allowPositioning={allowPositioning}
      subject={subject}
      connectFrom={connectFrom}
      updateLinkFrom={updateLinkFrom}
    />
    <NodeBucket
      id="NODE_BUCKET"
      layout={layoutVariable}
      subject={subject}
      sortOrder={sortOrder}
    />
  </Canvas>
);

ConcentricCircles.propTypes = {
  subject: PropTypes.object.isRequired,
  layoutVariable: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  allowHighlight: PropTypes.bool,
  createEdge: PropTypes.string,
  allowPositioning: PropTypes.bool,
  displayEdges: PropTypes.array,
  backgroundImage: PropTypes.string,
  concentricCircles: PropTypes.number,
  skewedTowardCenter: PropTypes.bool,
  sortOrder: PropTypes.array,
  connectFrom: PropTypes.string,
  updateLinkFrom: PropTypes.func,
};

ConcentricCircles.defaultProps = {
  highlight: null,
  allowHighlight: false,
  createEdge: null,
  allowPositioning: true,
  displayEdges: [],
  backgroundImage: null,
  concentricCircles: null,
  skewedTowardCenter: null,
  sortOrder: [],
  connectFrom: null,
  updateLinkFrom: () => {},
};

export { ConcentricCircles };

export default ConcentricCircles;
