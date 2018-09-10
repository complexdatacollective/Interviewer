import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, OrdinalBins } from '../';
import { makeGetPromptVariable, makeNetworkNodesForType } from '../../selectors/interface';
import { OrdinalBinBucket } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodeAttributesProperty } from '../../ducks/modules/network';

/**
  * OrdinalBin Interface
  * @extends Component
  */
class OrdinalBin extends Component {
  render() {
    const {
      promptForward,
      promptBackward,
      prompt,
      nodesForPrompt,
      stage,
    } = this.props;

    const {
      prompts,
    } = this.props.stage;

    return (
      <div className="ordinal-bin-interface">
        <div className="ordinal-bin-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <div className="ordinal-bin-interface__bucket">
          <OrdinalBinBucket
            nodes={nodesForPrompt}
            listId={`${stage.id}_${prompt.id}_NODE_BUCKET`}
            id={'NODE_BUCKET'}
            itemType="EXISTING_NODE"
            onDrop={this.onDrop}
            sortOrder={prompt.bucketSortOrder}
          />
        </div>
        <div className="ordinal-bin-interface__bins">
          <OrdinalBins stage={stage} prompt={prompt} />
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
  nodesForPrompt: PropTypes.array.isRequired,
};

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();
  const getPromptVariable = makeGetPromptVariable();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      nodesForPrompt: stageNodes.filter(
        node => !node[nodeAttributesProperty][activePromptVariable],
      ),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(OrdinalBin);

