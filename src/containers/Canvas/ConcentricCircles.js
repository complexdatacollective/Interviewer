import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeBucket } from '../../containers';
import NodeLayout from './NodeLayout';
import EdgeLayout from './EdgeLayout';
import Background from './Background';

class ConcentricCircles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connectFrom: null,
    };
  }

  updateLinkFrom = (id) => {
    this.setState({ connectFrom: id });
  }

  resetLinking = () => {
    this.setState({ connectFrom: null });
  }

  render() {
    const {
      stage,
      prompt,
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
    } = this.props;

    return (
      <div className="sociogram">
        <Background
          concentricCircles={concentricCircles}
          skewedTowardCenter={skewedTowardCenter}
          image={backgroundImage}
        />
        {
          displayEdges.length > 0 &&
          <EdgeLayout
            display={displayEdges}
            layout={layoutVariable}
          />
        }
        <NodeLayout
          id="NODE_LAYOUT"
          highlight={highlight}
          allowHighlight={allowHighlight}
          createEdge={createEdge}
          layout={layoutVariable}
          allowPositioning={allowPositioning}
          subject={subject}
          connectFrom={this.state.connectFrom}
          updateLinkFrom={this.updateLinkFrom}
        />
        <NodeBucket
          id="NODE_BUCKET"
          stage={stage}
          prompt={prompt}
        />
      </div>
    );
  }
}

ConcentricCircles.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
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
};

export { ConcentricCircles };

export default ConcentricCircles;
