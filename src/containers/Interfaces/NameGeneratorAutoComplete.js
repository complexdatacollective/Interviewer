import React, { Component } from 'react';
import { map } from 'lodash';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from '../../ui/components';
import withPrompt from '../../behaviours/withPrompt';
import Search from '../../containers/Search';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { makeGetSubjectType, makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { getNetworkNodes, makeGetNodeTypeDefinition, makeGetNodeLabel } from '../../selectors/network';
import { getCardAdditionalProperties, makeGetNodeIconName, makeGetPromptNodeModelData } from '../../selectors/name-generator';
import { PromptSwiper } from '../';
import { NodeBin, NodeList } from '../../components/';
import getParentKeyByNameValue from '../../utils/getParentKeyByNameValue';


/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  onSearchComplete(selectedResults) {
    const withNewModelData = map(selectedResults, result => ({
      ...this.props.newNodeModelData,
      ...result,
    }));

    this.props.batchAddNodes(withNewModelData, this.props.newNodeAttributes);
    this.props.closeSearch();
  }

  render() {
    const {
      closeSearch,
      excludedNodes,
      getCardTitle,
      nodeIconName,
      nodesForPrompt,
      nodeType,
      prompt,
      promptBackward,
      promptForward,
      searchIsOpen,
      stage,
      toggleSearch,
      details,
    } = this.props;

    const baseClass = 'name-generator-auto-complete-interface';

    const searchBtnClasses = cx(
      `${baseClass}__search-button`,
      {
        [`${baseClass}__search-button--hidden`]: searchIsOpen,
      },
    );

    const ListId = 'AUTOCOMPLETE_NODE_LIST';

    const searchOptions = { matchProperties: [], ...stage.searchOptions };

    // Map the matchproperties to add the entity attributes object, and replace names with
    // uuids, where possible.
    searchOptions.matchProperties = searchOptions.matchProperties.map((prop) => {
      const nodeTypeVariables = this.props.nodeTypeDefinition.variables;
      const replacedProp = getParentKeyByNameValue(nodeTypeVariables, prop);
      return (`${entityAttributesProperty}.${replacedProp}`);
    });

    return (
      <div className={baseClass}>
        <div className={`${baseClass}__prompt`}>
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={stage.prompts}
          />
        </div>

        <div className={`${baseClass}__nodes`}>
          <NodeList
            id={ListId}
            listId={`${stage.id}_${prompt.id}_${ListId}`}
            items={nodesForPrompt}
            itemType="EXISTING_NODE"
          />
        </div>

        <Icon
          name={nodeIconName}
          onClick={toggleSearch}
          className={searchBtnClasses}
        />

        <Search
          className={`${baseClass}__search`}
          key={prompt.id}
          dataSourceKey={this.props.stage.dataSource}
          getCardTitle={getCardTitle}
          details={details}
          excludedNodes={excludedNodes}
          nodeType={nodeType}
          onClick={closeSearch}
          onComplete={selectedResults => this.onSearchComplete(selectedResults)}
          options={searchOptions}
          stage={this.props.stage}
          nodeTypeDefinition={this.props.nodeTypeDefinition}
        />

        <div className="name-generator-auto-complete-interface__node-bin">
          <NodeBin
            accepts={meta => meta.itemType === 'EXISTING_NODE'}
            dropHandler={meta => this.props.removeNode(meta[entityPrimaryKeyProperty])}
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
  closeSearch: PropTypes.func.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  getCardTitle: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodeTypeDefinition: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  nodeType: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  searchIsOpen: PropTypes.bool.isRequired,
  stage: PropTypes.object.isRequired,
  toggleSearch: PropTypes.func.isRequired,
  details: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    batchAddNodes: bindActionCreators(sessionsActions.batchAddNodes, dispatch),
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    toggleSearch: bindActionCreators(searchActions.toggleSearch, dispatch),
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
      nodeTypeDefinition: getNodeTypeDefinition(state, { type: props.stage.subject.type }),
      nodeIconName: getNodeIconName(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeType: getNodeType(state, props),
      searchIsOpen: !state.search.collapsed,
      details: getCardAdditionalProperties(state, props),
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
