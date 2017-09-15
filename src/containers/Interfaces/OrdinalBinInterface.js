import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper } from '../Elements';
import OrdinalBin from '../Elements/OrdinalBin';
import { resetPropertyForAllNodes, resetEdgesOfType } from '../../utils/reset';

const resetInterface = (prompts) => {
  prompts.forEach((prompt) => {
    resetPropertyForAllNodes(prompt.ordinalbin.layout);
    resetEdgesOfType(prompt.ordinalbin.edge.type);
  });
};

/**
  * OrdinalBin Interface
  * @extends Component
  */
const OrdinalBinInterface = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
}) => (
  <div className="ordinalbin-interface">
    <div className="ordinalbin-interface__prompts">
      <PromptSwiper
        forward={promptForward}
        backward={promptBackward}
        prompts={stage.params.prompts}
        prompt={prompt}
        floating
      />
    </div>
    <div className="ordinalbin-interface__ordinalbin">
      <OrdinalBin
        stage={stage}
        prompt={prompt}
        key={prompt.id}
      />
    </div>
    <div style={{ position: 'absolute', right: 0, bottom: '20px' }}>
      <Button
        onClick={() => { resetInterface(stage.params.prompts); }}
      >
        Reset interface
      </Button>
    </div>
  </div>
);

OrdinalBinInterface.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

export default withPrompt(OrdinalBinInterface);
