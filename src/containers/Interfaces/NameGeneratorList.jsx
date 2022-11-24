import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { differenceBy, omit, get } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getEntityAttributes } from '../../ducks/modules/network';
import { makeNetworkNodesForOtherPrompts, makeGetAdditionalAttributes } from '../../selectors/interface';
import { getNetworkNodes, makeGetNodeTypeDefinition, makeGetNodeLabel } from '../../selectors/network';
import {
  getCardAdditionalProperties,
  getSortableFields,
  getInitialSortOrder,
  makeGetPromptNodeModelData,
} from '../../selectors/name-generator';
import Prompts from '../../components/Prompts';
import { FilterableListWrapper, CardList } from '../../components';
import withExternalData from '../withExternalData';
import getParentKeyByNameValue from '../../utils/getParentKeyByNameValue';

/**
  * Name Generator List Interface
  * @extends Component
  */
class NameGeneratorList extends Component {
  /**
   * Select node submit handler
   */
  onSubmitNewNode = (node) => {
    const {
      newNodeAttributes,
      newNodeModelData,
      addNode,
    } = this.props;
    const attributeData = {
      ...newNodeAttributes,
      ...node[entityAttributesProperty],
    };
    const modelData = {
      ...newNodeModelData,
      ...omit(node, entityAttributesProperty),
    };
    addNode(modelData, attributeData);
  }

  onRemoveNode = (node) => {
    const { removeNode } = this.props;
    removeNode(node[entityPrimaryKeyProperty]);
  }

  isNodeSelected = (node) => {
    const { selectedNodes } = this.props;
    return selectedNodes.some(
      (current) => current[entityPrimaryKeyProperty] === node[entityPrimaryKeyProperty],
    );
  };

  /**
    * toggle whether the card is selected or not.
    * @param {object} node
    */
  toggleCard = (node) => {
    if (this.isNodeSelected(node)) {
      this.onRemoveNode(node);
      return;
    }

    this.onSubmitNewNode(node);
  };

  detailsWithVariableUUIDs = (node) => {
    const {
      nodeTypeDefinition,
      visibleSupplementaryFields,
    } = this.props;

    const nodeTypeVariables = nodeTypeDefinition.variables;
    const attrs = getEntityAttributes(node);
    const fields = visibleSupplementaryFields;
    const withUUIDReplacement = fields.map((field) => ({
      ...field,
      variable: getParentKeyByNameValue(nodeTypeVariables, field.variable),
    }));

    return withUUIDReplacement.map((field) => ({ [field.label]: attrs[field.variable] }));
  }

  sortableFieldsWithVariableUUIDs = (sortFields) => {
    const { nodeTypeDefinition } = this.props;
    const nodeTypeVariables = nodeTypeDefinition.variables;
    return sortFields.map((field) => ({
      ...field,
      variable: getParentKeyByNameValue(nodeTypeVariables, field.variable),
    }));
  }

  initialSortWithVariableUUIDs = (initialSortOrder) => {
    const { nodeTypeDefinition } = this.props;
    const nodeTypeVariables = nodeTypeDefinition.variables;
    return initialSortOrder.map((rule) => ({
      ...rule,
      property: getParentKeyByNameValue(nodeTypeVariables, rule.property),
    }));
  }

  render() {
    const {
      initialSortOrder,
      getCardTitle,
      nodesForList,
      prompt,
      sortFields,
      stage: { prompts },
    } = this.props;

    return (
      <div className="name-generator-list-interface">
        <div className="name-generator-list-interface__prompt">
          <Prompts
            prompts={prompts}
            currentPrompt={prompt.id}
          />
        </div>
        <FilterableListWrapper
          key={`select-${prompt.id}`}
          initialSortOrder={this.initialSortWithVariableUUIDs(initialSortOrder)}
          sortFields={this.sortableFieldsWithVariableUUIDs(sortFields)}
          items={nodesForList}
          ListComponent={CardList}
          listComponentProps={{
            id: `select-${prompt.id}`,
            listId: `select-${prompt.id}`,
            details: this.detailsWithVariableUUIDs,
            title: prompt.text,
            label: getCardTitle,
            getCardTitle,
            onItemClick: this.toggleCard,
            isItemSelected: this.isNodeSelected,
          }}
        />
      </div>
    );
  }
}

NameGeneratorList.propTypes = {
  addNode: PropTypes.func.isRequired,
  initialSortOrder: PropTypes.array.isRequired,
  getCardTitle: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodesForList: PropTypes.array,
  selectedNodes: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  nodeTypeDefinition: PropTypes.object.isRequired,
  removeNode: PropTypes.func.isRequired,
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

    // Remove nodes nominated elsewhere (previously a prop called 'showExistingNodes')
    return differenceBy(
      externalNodes,
      networkNodesForOtherPrompts(state, props),
      entityPrimaryKeyProperty,
    );
  };
};

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodesForList = makeGetNodesForList();
  const getNodeTypeDefinition = makeGetNodeTypeDefinition();
  const getNodeLabel = makeGetNodeLabel();

  return function mapStateToProps(state, props) {
    const nodesForList = getNodesForList(state, props);

    return {
      getCardTitle: getNodeLabel(state, props),
      nodeTypeDefinition: getNodeTypeDefinition(state, props),
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
  withExternalData('stage.dataSource', 'externalData'),
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);
