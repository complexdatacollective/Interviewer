import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes, getDataByPrompt, getSortOrderDefault, getSortDirectionDefault } from '../../selectors/name-generator';
import { PromptSwiper } from '../../containers';
import { ListSelect } from '../../components';

// Render method for the node labels
const labelKey = 'nickname';
const label = node => `${node[labelKey]}`;
const details = node => [{ name: `${node.name}` }, { age: `${node.age}` }];

/**
  * Name Generator List Interface
  * @extends Component
  */
class NameGeneratorList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  /**
   * New node submit handler
   */
  onSubmitNewNode = (node) => {
    this.props.addorUpdateNode({ ...node, ...this.props.newNodeAttributes });
  }

  onRemoveNode = (item) => {
    this.props.removeNode(item.uid);
  }

  render() {
    const {
      initialSortOrder,
      initialSortDirection,
      nodesForList,
      prompt,
      promptBackward,
      promptForward,
      selectedNodes,
    } = this.props;

    const {
      prompts,
    } = this.props.stage;

    return (
      <div className="name-generator-interface">
        <div className="name-generator-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <ListSelect
          details={details}
          initialSortOrder={initialSortOrder}
          initialSortDirection={initialSortDirection}
          label={label}
          labelKey={labelKey}
          nodes={nodesForList}
          onRemoveNode={this.onRemoveNode}
          onSubmitNode={this.onSubmitNewNode}
          selectedNodes={selectedNodes}
          title={prompt.text}
        />
      </div>
    );
  }
}

NameGeneratorList.propTypes = {
  addorUpdateNode: PropTypes.func.isRequired,
  initialSortOrder: PropTypes.string,
  initialSortDirection: PropTypes.string,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForList: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  selectedNodes: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorList.defaultProps = {
  initialSortOrder: '',
  initialSortDirection: 'ASC',
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      initialSortOrder: getSortOrderDefault(state, props),
      initialSortDirection: getSortDirectionDefault(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForList: getDataByPrompt(state, props),
      selectedNodes: networkNodesForPrompt(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addorUpdateNode: bindActionCreators(networkActions.addNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
