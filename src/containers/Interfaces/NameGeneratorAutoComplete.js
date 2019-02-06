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
import { entityAttributesProperty } from '../../ducks/modules/network';
import { getNodeLabelFunction, makeGetSubjectType, makeNetworkNodesForPrompt, networkNodes, makeGetAdditionalAttributes } from '../../selectors/interface';
import { getCardDisplayLabel, getCardAdditionalProperties, makeGetNodeIconName, makeGetPromptNodeModelData } from '../../selectors/name-generator';
import { PromptSwiper } from '../';
import { NodeBin, NodeList } from '../../components/';

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
      getLabel,
      labelKey,
      nodeIconName,
      nodesForPrompt,
      nodeType,
      prompt,
      promptBackward,
      promptForward,
      searchIsOpen,
      stage,
      toggleSearch,
      visibleSupplementaryFields,
    } = this.props;

    const baseClass = 'name-generator-auto-complete-interface';

    const searchBtnClasses = cx(
      `${baseClass}__search-button`,
      {
        [`${baseClass}__search-button--hidden`]: searchIsOpen,
      },
    );

    const ListId = 'AUTOCOMPLETE_NODE_LIST';

    const searchOptions = { matchProperties: [], ...prompt.searchOptions };
    searchOptions.matchProperties = searchOptions.matchProperties.map(prop => (
      `${entityAttributesProperty}.${prop}`));

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
            label={getLabel}
            listId={`${stage.id}_${prompt.id}_${ListId}`}
            nodes={nodesForPrompt}
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
          dataSourceKey={prompt.dataSource}
          primaryDisplayField={labelKey}
          additionalAttributes={visibleSupplementaryFields}
          excludedNodes={excludedNodes}
          nodeType={nodeType}
          onClick={closeSearch}
          onComplete={selectedResults => this.onSearchComplete(selectedResults)}
          options={searchOptions}
        />

        <div className="name-generator-auto-complete-interface__node-bin">
          <NodeBin id="NODE_BIN" />
        </div>

      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  batchAddNodes: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  getLabel: PropTypes.func.isRequired,
  labelKey: PropTypes.string.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  nodeType: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  searchIsOpen: PropTypes.bool.isRequired,
  stage: PropTypes.object.isRequired,
  toggleSearch: PropTypes.func.isRequired,
  visibleSupplementaryFields: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    batchAddNodes: bindActionCreators(sessionsActions.batchAddNodes, dispatch),
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    toggleSearch: bindActionCreators(searchActions.toggleSearch, dispatch),
  };
}

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodeType = makeGetSubjectType();
  const getNodeIconName = makeGetNodeIconName();

  return function mapStateToProps(state, props) {
    return {
      excludedNodes: networkNodes(state, props),
      getLabel: getNodeLabelFunction(state),
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodeIconName: getNodeIconName(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeType: getNodeType(state, props),
      searchIsOpen: !state.search.collapsed,
      visibleSupplementaryFields: getCardAdditionalProperties(state, props),
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
