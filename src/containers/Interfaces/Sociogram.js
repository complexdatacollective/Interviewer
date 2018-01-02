import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, ConcentricCircles } from '../../containers/';
import { resetPropertyForAllNodes, resetEdgesOfType } from '../../utils/reset';

const resetInterface = (prompts) => {
  prompts.forEach((prompt) => {
    resetPropertyForAllNodes(prompt.layout.layoutVariable);
    resetEdgesOfType(prompt.edges.creates);
  });
};

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
}) => (
  <div className="sociogram-interface">
    <div className="sociogram-interface__prompts">
      <PromptSwiper
        forward={promptForward}
        backward={promptBackward}
        prompts={stage.prompts}
        prompt={prompt}
        floating
      />
    </div>
    <div className="sociogram-interface__sociogram">
      <ConcentricCircles
        stage={stage}
        prompt={prompt}
        key={prompt.id}
      />
    </div>
    <div style={{ position: 'absolute', right: 0, bottom: '20px' }}>
      <Button
        onClick={() => { resetInterface(stage.prompts); }}
      >
        Reset interface
      </Button>
    </div>
  </div>
);

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

export default withPrompt(Sociogram);
