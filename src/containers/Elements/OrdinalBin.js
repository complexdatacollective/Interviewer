/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';

const Bin = ({ stage, prompt }) => (
  <div className="ordinalbin">
    {
      prompt.ordinalbin.edge &&
      <EdgeLayout
        stage={stage}
        prompt={prompt}
      />
    }
    <NodeLayout
      stage={stage}
      prompt={prompt}
    />
    <NodeBucket
      stage={stage}
      prompt={prompt}
    />
  </div>
);

Bin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default Bin;
