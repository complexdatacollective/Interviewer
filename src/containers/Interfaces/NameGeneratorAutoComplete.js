import React, { Component } from 'react';
import { map } from 'lodash';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import withPrompt from '../../behaviours/withPrompt';
import Search from '../Search';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeGetSubjectType, makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { getNetworkNodes, makeGetNodeTypeDefinition, makeGetNodeLabel } from '../../selectors/network';
import { getCardAdditionalProperties, makeGetNodeIconName, makeGetPromptNodeModelData } from '../../selectors/name-generator';
import Prompts from '../../components/Prompts';
import { NodeBin, NodeList } from '../../components';
import getParentKeyByNameValue from '../../utils/getParentKeyByNameValue';

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  onSearchComplete = (selectedResults) => {
    const {
      newNodeModelData,
      batchAddNodes,
      newNodeAttributes,
      stage,
    } = this.props;
    const withNewModelData = map(selectedResults, (result) => ({
      ...newNodeModelData,
      ...result,
    }));

    batchAddNodes(
      withNewModelData,
      newNodeAttributes,
      stage.subject.type,
    );
  }

  render() {
    const {
      excludedNodes,
      getCardTitle,
      nodeIconName,
      nodesForPrompt,
      nodeType,
      prompt,
      stage,
      details,
      nodeTypeDefinition,
      removeNode,
    } = this.props;

    const {
      prompts,
    } = stage;

    const baseClass = 'name-generator-auto-complete-interface';

    const ListId = 'AUTOCOMPLETE_NODE_LIST';

    const searchOptions = { matchProperties: [], ...stage.searchOptions };

    // Map the matchproperties to add the entity attributes object, and replace names with
    // uuids, where possible.
    searchOptions.matchProperties = searchOptions.matchProperties.map((prop) => {
      const nodeTypeVariables = nodeTypeDefinition.variables;
      const replacedProp = getParentKeyByNameValue(nodeTypeVariables, prop);
      return (`${entityAttributesProperty}.${replacedProp}`);
    });

    return (
      <div className={baseClass}>
        <div className={`${baseClass}__prompt`}>
          <Prompts
            prompts={prompts}
            currentPrompt={prompt.id}
          />
        </div>

        <div className={`${baseClass}__nodes`}>
          <NodeList
            id={ListId}
            listId={`${stage.id}_${prompt.id}_${ListId}`}
            items={nodesForPrompt}
            stage={stage}
            itemType="EXISTING_NODE"
          />
        </div>

        <div className={`${baseClass}__search`}>
          <Search
            key={prompt.id}
            nodeIconName={nodeIconName}
            dataSourceKey={stage.dataSource}
            getCardTitle={getCardTitle}
            details={details}
            excludedNodes={excludedNodes}
            nodeType={nodeType}
            onComplete={this.onSearchComplete}
            options={searchOptions}
            stage={stage}
            nodeTypeDefinition={nodeTypeDefinition}
          />
        </div>

        <div className="name-generator-auto-complete-interface__node-bin">
          <NodeBin
            accepts={(meta) => meta.itemType === 'EXISTING_NODE'}
            dropHandler={(meta) => removeNode(meta[entityPrimaryKeyProperty])}
            id="NODE_BIN"
          />
        </div>

      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  batchAddNodes: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  getCardTitle: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodeTypeDefinition: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  nodeType: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  details: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    batchAddNodes: bindActionCreators(sessionsActions.batchAddNodes, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodeType = makeGetSubjectType();
  const getNodeIconName = makeGetNodeIconName();
  const getNodeTypeDefinition = makeGetNodeTypeDefinition();
  const getNodeLabel = makeGetNodeLabel();

  return function mapStateToProps(state, props) {
    return {
      excludedNodes: getNetworkNodes(state, props),
      getCardTitle: getNodeLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodeTypeDefinition: getNodeTypeDefinition(state, props),
      nodeIconName: getNodeIconName(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeType: getNodeType(state, props),
      details: getCardAdditionalProperties(state, props),
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
