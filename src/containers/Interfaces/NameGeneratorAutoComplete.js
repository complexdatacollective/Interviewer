import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'network-canvas-ui';

import withPrompt from '../../behaviours/withPrompt';
import Search from '../../containers/Search';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { getNodeLabelFunction, makeNetworkNodesForPrompt, networkNodes } from '../../selectors/interface';
import { getCardDisplayLabel, getCardAdditionalProperties, makeGetNodeIconName, makeGetNodeType, makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { PromptSwiper } from '../';
import { NodeBin, NodeList } from '../../components/';

const networkNodesForPrompt = makeNetworkNodesForPrompt();
const getPromptNodeAttributes = makeGetPromptNodeAttributes();
const getNodeType = makeGetNodeType();
const getNodeIconName = makeGetNodeIconName();

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onSearchComplete(selectedResults) {
    this.props.addNodes(selectedResults, this.props.newNodeAttributes);
    this.props.closeSearch();
  }

  onKeyDown = (evt) => {
    if (this.props.searchIsOpen && (evt.key === 'Escape' || evt.keyCode === 27)) {
      this.props.closeSearch();
    }
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
          options={prompt.searchOptions}
        />

        <div className="name-generator-auto-complete-interface__node-bin">
          <NodeBin id="NODE_BIN" />
        </div>

      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  addNodes: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  getLabel: PropTypes.func.isRequired,
  labelKey: PropTypes.string.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
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
    addNodes: bindActionCreators(networkActions.addNodes, dispatch),
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    toggleSearch: bindActionCreators(searchActions.toggleSearch, dispatch),
  };
}

function makeMapStateToProps() {
  return function mapStateToProps(state, props) {
    return {
      excludedNodes: networkNodes(state, props),
      getLabel: getNodeLabelFunction(state),
      labelKey: getCardDisplayLabel(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
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
