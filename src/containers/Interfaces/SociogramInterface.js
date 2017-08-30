/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper } from '../Elements';
import Sociogram from '../Elements/Sociogram';
import { resetPropertyForAllNodes, resetEdgesOfType } from '../../utils/reset';

const resetInterface = (prompts) => {
  prompts.forEach((prompt) => {
    resetPropertyForAllNodes(prompt.sociogram.layout);
    resetEdgesOfType(prompt.sociogram.edge.type);
  });
};

/**
  * Sociogram Interface
  * @extends Component
  */
const SociogramInterface = ({
  promptForward,
  promptBackward,
  prompt,
  config,
}) => {
  return (
    <div className="sociogram-interface">
      <div className="sociogram-interface__prompts">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompts={config.params.prompts}
          prompt={prompt}
          floating
        />
      </div>
      <div className="sociogram-interface__sociogram">
  
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: '20px' }}>
        <Button
          onClick={() => { resetInterface(config.params.prompts); }}
        >
          Reset interface
        </Button>
      </div>
    </div>
  );
};

SociogramInterface.propTypes = {
  config: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

export default withPrompt(SociogramInterface);
