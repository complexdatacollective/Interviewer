import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, OrdinalBins } from '../';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { OrdinalBinBucket } from '../../components';
import { actionCreators as networkActions } from '../../ducks/modules/network';


const label = node => `${node.nickname}`;

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
            label={label}
            listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
            id={'MAIN_NODE_LIST'}
            accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
            itemType="EXISTING_NODE"
            onDrop={this.onDrop}
            onSelect={this.onSelectNode}
          />
        </div>
        <div className="ordinal-bin-interface__OrdinalBin">
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
  const networkNodesForPrompt = makeNetworkNodesForPrompt();

  return function mapStateToProps(state, props) {
    return {
      nodesForPrompt: networkNodesForPrompt(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(OrdinalBin);

