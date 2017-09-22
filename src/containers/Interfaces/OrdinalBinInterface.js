import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, OrdinalBins } from '../Elements';
import { NodeList } from '../../components/Elements';
import { networkNodesForPrompt } from '../../selectors/interface';

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
    <div className="ordinal-bin-interface__prompt">
      <PromptSwiper
        forward={promptForward}
        backward={promptBackward}
        prompts={stage.params.prompts}
        prompt={prompt}
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
      <OrdinalBins
        stage={stage}
        prompt={prompt}
        key={prompt.id}
      />
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

function mapStateToProps(state, props) {
  const newNodeAttributes = {
    type: props.stage.params.nodeType,
    stageId: props.stage.id,
    promptId: props.prompt.id,
    ...props.prompt.nodeAttributes,
  };

  return {
    newNodeAttributes,
    nodesForPrompt: networkNodesForPrompt(state, props),
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps),
)(OrdinalBin);
