/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';

const Sociogram = ({ config, prompt }) => (
  <div className="sociogram">
    <SociogramBackground {...prompt.sociogram.background} />
    <NodeLayout
      config={config}
      prompt={prompt}
    />
    <NodeBucket
      config={config}
      prompt={prompt}
    />
  </div>
);

Sociogram.propTypes = {
  config: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default Sociogram;
