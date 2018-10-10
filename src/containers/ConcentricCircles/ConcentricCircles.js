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

    return (
      <div className="sociogram">
        <Background stage={stage} prompt={prompt} />
        {
          prompt.edges &&
          <EdgeLayout
            stage={stage}
            prompt={prompt}
          />
        }
        <NodeLayout
          id="NODE_LAYOUT"
          stage={stage}
          prompt={prompt}
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
