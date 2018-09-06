import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';

import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { NodePrimaryKeyProperty } from '../../ducks/modules/network';
import { makeNetworkNodesForOtherPrompts, networkNodes } from '../../selectors/interface';
import {
  getDataByPrompt,
  getCardDisplayLabel,
  getCardAdditionalProperties,
  getSortableFields,
  makeGetPromptNodeAttributes,
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
    this.props.addNode({ ...node }, { ...this.props.newNodeAttributes });
  }

  onRemoveNode = (node) => {
    this.props.removeNode(node[NodePrimaryKeyProperty]);
  }

  label = node => node[this.props.labelKey];

  details = node => this.props.visibleSupplementaryFields.map(
    field => ({ [field.label]: node[field.variable] }));

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
  initialSortOrder: PropTypes.object,
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
  initialSortOrder: {
    property: '',
    direction: 'asc',
  },
};

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return function mapStateToProps(state, props) {
    let nodesForList = getDataByPrompt(state, props);
    if (!props.stage.showExistingNodes) {
      nodesForList = differenceBy(
        getDataByPrompt(state, props),
        networkNodesForOtherPrompts(state, props),
        NodePrimaryKeyProperty);
    }

    return {
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForList,
      selectedNodes: networkNodes(state),
      sortFields: getSortableFields(state, props),
      visibleSupplementaryFields: getCardAdditionalProperties(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(sessionsActions.addNodes, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
