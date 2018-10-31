import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, CategoricalList } from '../';
import { makeGetPromptVariable, makeNetworkNodesForType } from '../../selectors/interface';
import { MultiNodeBucket } from '../../components';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodeAttributesProperty, nodePrimaryKeyProperty } from '../../ducks/modules/network';

/**
  * CategoricalBin Interface
  * @extends Component
  */
class CategoricalBin extends Component {
  onDrop = ({ meta }) => {
    const newValue = {};
    newValue[this.props.activePromptVariable] = null;
    this.props.toggleNodeAttributes(meta[nodePrimaryKeyProperty], newValue);
  };

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
      <div className="categorical-bin-interface">
        <div className="categorical-bin-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <div className="categorical-bin-interface__bucket">
          <MultiNodeBucket
            nodes={nodesForPrompt}
            listId={`${stage.id}_${prompt.id}_CAT_BUCKET`}
            id={'CAT_BUCKET'}
            accepts={() => true}
            onDrop={this.onDrop}
            sortOrder={prompt.bucketSortOrder}
          />
        </div>
        <CategoricalList key={prompt.id} stage={stage} prompt={prompt} />
      </div>
    );
  }
}

CategoricalBin.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  toggleNodeAttributes: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();
  const getPromptVariable = makeGetPromptVariable();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      activePromptVariable,
      nodesForPrompt: stageNodes.filter(
        node => !node[nodeAttributesProperty][activePromptVariable],
      ),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(CategoricalBin);
