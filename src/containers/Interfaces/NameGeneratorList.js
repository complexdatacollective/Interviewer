import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy, omit } from 'lodash';

import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodePrimaryKeyProperty, getNodeAttributes, nodeAttributesProperty } from '../../ducks/modules/network';
import { makeNetworkNodesForOtherPrompts, networkNodes, makeGetAdditionalAttributes } from '../../selectors/interface';
import {
  getDataByPrompt,
  getCardDisplayLabel,
  getCardAdditionalProperties,
  getSortableFields,
  getInitialSortOrder,
  makeGetPromptNodeModelData,
} from '../../selectors/name-generator';
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
   * Select node submit handler
   */
  onSubmitNewNode = (node) => {
    const attributeData = {
      ...this.props.newNodeAttributes,
      ...node[nodeAttributesProperty],
    };
    const modelData = {
      ...this.props.newNodeModelData,
      ...omit(node, nodeAttributesProperty),
    };
    this.props.addNode(modelData, attributeData);
  }

  onRemoveNode = (node) => {
    this.props.removeNode(node[nodePrimaryKeyProperty]);
  }

  label = node => getNodeAttributes(node)[this.props.labelKey];

  details = (node) => {
    const attrs = getNodeAttributes(node);
    const fields = this.props.visibleSupplementaryFields;
    return fields.map(field => ({ [field.label]: attrs[field.variable] }));
  }

  render() {
    const {
      initialSortOrder,
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
      <div className="name-generator-list-interface">
        <div className="name-generator-list-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <ListSelect
          key={`select-${prompt.id}`}
          details={this.details}
          initialSortOrder={initialSortOrder}
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
  initialSortOrder: PropTypes.array.isRequired,
  labelKey: PropTypes.string.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
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

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return function mapStateToProps(state, props) {
    let nodesForList = getDataByPrompt(state, props);
    if (!props.stage.showExistingNodes) {
      nodesForList = differenceBy(
        getDataByPrompt(state, props),
        networkNodesForOtherPrompts(state, props),
        nodePrimaryKeyProperty);
    }

    return {
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodesForList,
      initialSortOrder: getInitialSortOrder(state, props),
      selectedNodes: networkNodes(state),
      sortFields: getSortableFields(state, props),
      visibleSupplementaryFields: getCardAdditionalProperties(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(sessionsActions.addNode, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
