import React from 'react';
import PropTypes from 'prop-types';
import { NodeBucket } from '../../containers';
import NodeLayout from './NodeLayout';
import EdgeLayout from './EdgeLayout';
import Background from './Background';

const ConcentricCircles = React.forwardRef(({ stage, prompt }, ref) => (
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
      ref={ref}
    />
    <NodeBucket
      id="NODE_BUCKET"
      stage={stage}
      prompt={prompt}
    />
  </div>
));

ConcentricCircles.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export { ConcentricCircles };

export default ConcentricCircles;
