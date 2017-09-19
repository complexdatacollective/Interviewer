import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper } from '../Elements';
import { NodeList } from '../../components/Elements';
import Bin from '../Elements/OrdinalBin';
import { resetPropertyForAllNodes, resetEdgesOfType } from '../../utils/reset';

const resetInterface = (prompts) => {
  prompts.forEach((prompt) => {
    resetPropertyForAllNodes(prompt.ordinalbin.layout);
    resetEdgesOfType(prompt.ordinalbin.edge.type);
  });
};

// Render method for the node labels
const label = node => `${node.nickname}`;

/**
  * OrdinalBin Interface
  * @extends Component
  */
const OrdinalBin = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
  nodesForPrompt,
}) => (
  <div className="ordinal-bin-interface">
    <div className="ordinal-bin-interface__prompts">
      <PromptSwiper
        forward={promptForward}
        backward={promptBackward}
        prompts={stage.params.prompts}
        prompt={prompt}
        floating
      />
    </div>
    <div className="ordinal-bin-interface__nodes">
      <NodeList
        nodes={nodesForPrompt}
        label={label}
        droppableName="MAIN_NODE_LIST"
        acceptsDraggableType="NEW_NODE"
        draggableType="EXISTING_NODE"
        handleDropNode={this.onDropNode}
        handleSelectNode={this.onSelectNode}
      />
    </div>
    <div className="ordinal-bin-interface__ordinalbin">
      <Bin
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

OrdinalBin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

export default withPrompt(OrdinalBin);
