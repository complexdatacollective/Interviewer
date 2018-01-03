import React from 'react';
import PropTypes from 'prop-types';
import { NodeBucket } from '../../containers';
import NodeLayout from './NodeLayout';
import EdgeLayout from './EdgeLayout';
import Background from './Background';

const Sociogram = ({ stage, prompt }) => (
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
    />
    <NodeBucket
      stage={stage}
      prompt={prompt}
    />
  </div>
);

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export { Sociogram };

export default Sociogram;
