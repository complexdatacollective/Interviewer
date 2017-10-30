/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';

const Sociogram = ({ stage, prompt }) => (
  <div className="sociogram">
    <SociogramBackground {...prompt.background} />

  </div>
);

// {
//   prompt.sociogram.edge &&
//   <EdgeLayout
//     stage={stage}
//     prompt={prompt}
//   />
// }
// <NodeLayout
//   stage={stage}
//   prompt={prompt}
// />
// <NodeBucket
//   stage={stage}
//   prompt={prompt}
// />

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default Sociogram;
