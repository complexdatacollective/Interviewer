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
    const { stage, prompt } = this.props;

    const layoutVariable = prompt.layout && prompt.layout.layoutVariable;
    const highlight = prompt.highlight && prompt.highlight.variable;
    const allowHighlight = prompt.highlight && prompt.highlight.allowHighlight;
    const createEdge = prompt.edges && prompt.edges.create;
    const allowPositioning = prompt.layout && prompt.layout.allowPositioning;
    const displayEdges = (prompt.edges && prompt.edges.display) || [];

    return (
      <div className="sociogram">
        <Background stage={stage} prompt={prompt} />
        {
          prompt.edges &&
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
          subject={prompt.subject}
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
};

export { ConcentricCircles };

export default ConcentricCircles;
