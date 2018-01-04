import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';

import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeNetworkNodesForOtherPrompts, networkNodes } from '../../selectors/interface';
import { getDataByPrompt, getCardDisplayLabel, getCardAdditionalProperties, getSortDirectionDefault, getSortFields, getSortOrderDefault, makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { PromptSwiper } from '../../containers';
import { ListSelect } from '../../components';

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
    this.props.addNode({ ...node, ...this.props.newNodeAttributes });
  }

  onRemoveNode = (item) => {
    this.props.removeNode(item.uid);
  }

  label = node => `${node[this.props.labelKey]}`;

  details = node => this.props.visibleSupplementaryFields.map(
    field => ({ [field.label]: node[field.variable] }));

  render() {
    const {
      initialSortOrder,
      initialSortDirection,
      labelKey,
      nodesForList,
      prompt,
      promptBackward,
      promptForward,
      selectedNodes,
      sortFields,
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
          details={this.details}
          initialSortOrder={initialSortOrder}
          initialSortDirection={initialSortDirection}
          label={this.label}
          labelKey={labelKey}
          nodes={nodesForList}
          onRemoveNode={this.onRemoveNode}
          onSubmitNode={this.onSubmitNewNode}
          selectedNodes={selectedNodes}
          sortFields={sortFields}
          title={prompt.text}
        />
      </div>
    );
  }
}

NameGeneratorList.propTypes = {
  addNode: PropTypes.func.isRequired,
  initialSortOrder: PropTypes.string,
  initialSortDirection: PropTypes.string,
  labelKey: PropTypes.string.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForList: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  selectedNodes: PropTypes.array.isRequired,
  sortFields: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
  visibleSupplementaryFields: PropTypes.array.isRequired,
};

NameGeneratorList.defaultProps = {
  initialSortOrder: '',
  initialSortDirection: 'ASC',
};

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return function mapStateToProps(state, props) {
    let nodesForList = getDataByPrompt(state, props);
    if (!props.stage.showExistingNodes) {
      nodesForList = differenceBy(getDataByPrompt(state, props), networkNodesForOtherPrompts(state, props), 'uid');
    }

    return {
      initialSortOrder: getSortOrderDefault(state, props),
      initialSortDirection: getSortDirectionDefault(state, props),
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForList,
      selectedNodes: networkNodes(state),
      sortFields: getSortFields(state, props),
      visibleSupplementaryFields: getCardAdditionalProperties(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNodes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
