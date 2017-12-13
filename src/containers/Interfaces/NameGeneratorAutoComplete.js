import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import withPrompt from '../../behaviours/withPrompt';
import Search from '../../containers/Search';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { makeRehydrateForm } from '../../selectors/rehydrate';
import PromptSwiper from '../PromptSwiper';

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  onSearchComplete(selectedResults) {
    this.props.addNodeBatch(selectedResults, this.props.newNodeAttributes);
    this.props.closeSearch();
  }

  render() {
    const {
      form,
      nodesForPrompt,
      prompt,
      promptForward,
      promptBackward,
      openSearch,
      closeSearch,
    } = this.props;

    const displayField = prompt.displayLabel;

    const {
      prompts,
    } = this.props.stage;

    return (
      <div className="name-generator-interface name-generator-auto-complete-interface">
        <div className="name-generator-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>

        <div>
          <ol className="name-generator-auto-complete-interface__selected-nodes">
            {nodesForPrompt && nodesForPrompt.map((r, i) => <li key={`${i}`}>{r[displayField]}</li>)}
          </ol>
        </div>

        <button className="name-generator-interface__add-person" onClick={() => openSearch()}>
          Add
        </button>

        <Search
          form={form}
          options={prompt.autoCompleteOptions}
          dataSourceKey={prompt.dataSource}
          onClick={closeSearch}
          onComplete={selectedResults => this.onSearchComplete(selectedResults)}
          excludedNodes={nodesForPrompt}
          displayFields={[prompt.displayLabel, ...prompt.displayProperties]}
        />

      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  addNodeBatch: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  openSearch: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    addNodeBatch: bindActionCreators(networkActions.addNodeBatch, dispatch),
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    openSearch: bindActionCreators(searchActions.openSearch, dispatch),
  };
}

function makeMapStateToProps() {
  const rehydrateForm = makeRehydrateForm();
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();

  return function mapStateToProps(state, props) {
    return {
      form: rehydrateForm(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
