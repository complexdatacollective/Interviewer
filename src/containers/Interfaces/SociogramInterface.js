import React from 'react';

import {
  Sociogram,
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
} from '../Elements';

/**
  * Sociogram Interface
  * @extends Component
  */
const SociogramInterface = () => (
  <div className="sociogram-interface">
    <Sociogram>
      <SociogramBackground />
      <NodeLayout />
      <EdgeLayout />
    </Sociogram>
  </div>
);

export default SociogramInterface;
