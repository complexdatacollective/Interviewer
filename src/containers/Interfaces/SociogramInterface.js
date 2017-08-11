import React from 'react';
import PropTypes from 'prop-types';
import {
  Sociogram,
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
  PromptSwiper,
} from '../Elements';

/**
  * Sociogram Interface
  * @extends Component
  */
const SociogramInterface = ({ config: { params: { prompts } } }) => (
  <div className="sociogram-interface">
    <div className="sociogram-interface__prompts">
      <PromptSwiper prompts={prompts} />
    </div>
    <div className="sociogram-interface__sociogram">
      <div className="sociogram-interface__container">
        <Sociogram>
          <SociogramBackground />
          <NodeLayout />
          <EdgeLayout />
          <NodeBucket />
        </Sociogram>
      </div>
    </div>
  </div>
);

SociogramInterface.propTypes = {
  config: PropTypes.object.isRequired,
};


export default SociogramInterface;
