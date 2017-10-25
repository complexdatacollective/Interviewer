import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, OrdinalBins, NodeBucket } from '../Elements';
import { actionCreators as networkActions } from '../../ducks/modules/network';

/**
  * OrdinalBin Interface
  * @extends Component
  */
class OrdinalBin extends Component {
  onDropNode = (hits, coords, node) => {
    this.props.updateNode({ ...node });
  };
  render() {
    const {
      promptForward,
      promptBackward,
      prompt,
      stage,
    } = this.props;

    return (
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
          <NodeBucket
            stage={stage}
            prompt={prompt}
            onDropNode={this.onDropNode}
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
  }
}

OrdinalBin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps, mapDispatchToProps),
)(OrdinalBin);
