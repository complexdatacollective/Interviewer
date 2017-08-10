/* eslint-disable */




import React from 'react';

import {
  SociogramGraph,
  SociogramBackground,
  SociogramNodes,
  SociogramEdges,
} from '../Elements';

/**
  * Sociogram Interface
  * @extends Component
  */
const SociogramInterface = () => (
  <div className="sociogram-interface">
    <SociogramGraph>
      <SociogramBackground />
      <SociogramNodes />
      <SociogramEdges />
    </SociogramGraph>
  </div>
);

export default SociogramInterface;
