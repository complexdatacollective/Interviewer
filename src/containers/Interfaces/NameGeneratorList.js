import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy, omit, get } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty, getEntityAttributes, entityAttributesProperty } from '../../ducks/modules/network';
import { makeNetworkNodesForOtherPrompts, makeGetAdditionalAttributes } from '../../selectors/interface';
import { getNetworkNodes } from '../../selectors/network';
import {
  getCardDisplayLabel,
  getCardAdditionalProperties,
  getSortableFields,
  getInitialSortOrder,
  makeGetPromptNodeModelData,
} from '../../selectors/name-generator';
import { PromptSwiper } from '../../containers';
import { ListSelect, CardList, NodeList } from '../../components';
import withExternalData from '../../containers/withExternalData';

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
      ...node[entityAttributesProperty],
    };
    const modelData = {
      ...this.props.newNodeModelData,
      ...omit(node, entityAttributesProperty),
    };
    this.props.addNode(modelData, attributeData);
  }

  onRemoveNode = (node) => {
    this.props.removeNode(node[entityPrimaryKeyProperty]);
  }

  label = node => getEntityAttributes(node)[this.props.labelKey];

  details = (node) => {
    const attrs = getEntityAttributes(node);
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
          initialSortOrder={initialSortOrder}
          sortFields={sortFields}
          nodes={nodesForList}
          ListComponent={NodeList}
          listComponentProps={{
            details: this.details,
            title: prompt.text,
            label: this.label,
            labelKey,
            onRemoveNode: this.onRemoveNode,
            onSubmitNode: this.onSubmitNewNode,
            selectedNodes,
          }}
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

NameGeneratorList.defaultProps = {
  nodesForList: [],
};

const makeGetNodesForList = () => {
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return (state, props) => {
    const externalNodes = get(props, 'externalData.nodes', []);

    if (!props.stage.showExistingNodes) {
      return differenceBy(
        externalNodes,
        networkNodesForOtherPrompts(state, props),
        entityPrimaryKeyProperty,
      );
    }

    return externalNodes;
  };
};

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodesForList = makeGetNodesForList();

  return function mapStateToProps(state, props) {
    const nodesForList = getNodesForList(state, props);

    return {
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodesForList,
      initialSortOrder: getInitialSortOrder(state, props),
      selectedNodes: getNetworkNodes(state),
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
  withExternalData('prompt.dataSource', 'externalData'),
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
