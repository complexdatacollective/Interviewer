/* eslint-disable */
import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import PropTypes from 'prop-types';

import { actionCreators as searchActions } from '../../ducks/modules/search';
import withPrompt from '../../behaviours/withPrompt';
import Search from '../../containers/Search';
import { makeRehydrateForm } from '../../selectors/rehydrate';

const forms = {
  ADD_NODE_AUTOCOMPLETE: Symbol('ADD_NODE_AUTOCOMPLETE'),
};

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  get displayField() {
    // TODO: review protocol definition
    return this.props.prompt.autoCompleteOptions.matchProperties[0];
  }

  render() {
    const { form, prompt, openSearch, closeSearch } = this.props;
    const valueField = this.displayField;
    const resultHandler = result => this.setState({ selectedNode: result });
    const selectedResults = this.props.selectedSearchResults;

    return (
      <div className="name-generator-auto-complete-interface">
        <p>{prompt.text}</p>

        <ol className="name-generator-auto-complete-interface__selected-nodes">
          {selectedResults && selectedResults.map((r, i) => <li key={`${i}`}>{r[valueField]}</li>)}
        </ol>

        <button className="name-generator-interface__add-person" onClick={() => openSearch()}>
          Add
        </button>

        <Search
          form={form}
          options={prompt.autoCompleteOptions}
          dataSourceKey={prompt.dataSource}
        >
        </Search>
      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  form: PropTypes.object.isRequired,
  openSearch: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  selectedSearchResults: PropTypes.array,
};

function mapDispatchToProps(dispatch) {
  return {
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    openSearch: bindActionCreators(searchActions.openSearch, dispatch),
  };
}

function makeMapStateToProps() {
  const rehydrateForm = makeRehydrateForm();
  return function mapStateToProps(state, props) {
    return {
      form: rehydrateForm(state, props),
      // TODO: selector
      selectedSearchResults: state.search.selectedResults,
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
