import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import PropTypes from 'prop-types';

import { actionCreators as modalActions } from '../../ducks/modules/modals';
import withPrompt from '../../behaviours/withPrompt';
import { NodeForm } from '../../containers';
import { makeRehydrateForm } from '../../selectors/rehydrate';
import { getExternalData } from '../../selectors/protocol';

const forms = {
  ADD_NODE_AUTOCOMPLETE: Symbol('ADD_NODE_AUTOCOMPLETE'),
};

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      selectedNode: null,
    };
    this.searchOptions = props.prompt.autoCompleteOptions;
    this.searchDataNodes = props.externalData[props.prompt.dataSource].nodes;
  }

  onChange(event, newValue) {
    let searchResults;
    if (newValue.length > 0) {
      searchResults = this.searchDataNodes.filter(node => this.isMatchingResult(newValue, node));
      if (this.searchOptions.sortOrder) {
        // TODO: protocol should define sort order(s) as array
        const props = Object.keys(this.searchOptions.sortOrder);
        const orders = props.map(p => this.searchOptions.sortOrder[p]);
        searchResults = orderBy(searchResults, props, orders);
      }
    } else {
      searchResults = [];
    }
    this.setState({ searchResults });
  }

  get displayField() {
    // TODO: review protocol definition
    return this.searchOptions.matchProperties[0];
  }

  isMatchingResult(searchTerm, candidate) {
    const searchProps = this.searchOptions.matchProperties;
    // TODO: fuzziness
    return searchProps.some(prop => candidate[prop].includes(searchTerm));
  }

  addNew() {
    this.setState({ searchResults: [] });
    this.props.openModal(forms.ADD_NODE_AUTOCOMPLETE);
  }

  render() {
    const { form, prompt } = this.props;
    const valueField = this.displayField;
    const resultHandler = result => this.setState({ selectedNode: result });

    function resultToString(result, id) {
      return (<li key={`result_${id}`}>
        <a onClick={() => resultHandler(result)}>{result[valueField]}</a>
      </li>);
    }

    return (
      <div className="name-generator-auto-complete-interface">
        <button className="name-generator-interface__add-person" onClick={() => this.addNew()}>
          Add
        </button>

        <p>{prompt.text}</p>

        <NodeForm
          name={forms.ADD_NODE_AUTOCOMPLETE}
          title={form.title}
          fields={form.fields}
          entity={form.entity}
          type={form.type}
          autoPopulate={form.autoPopulate}
          onSubmit={() => { /* TODO: wire up to real interface */ }}
          handleChange={(event, newValue) => this.onChange(event, newValue)}
        >
          <p>{this.state.searchResults.length && 'Results:'}</p>
          <ol className="name-generator-auto-complete-results">
            {this.state.searchResults.map(resultToString)}
          </ol>
        </NodeForm>

        <p>{this.state.selectedNode && this.state.selectedNode[valueField]}</p>
      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  externalData: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

function makeMapStateToProps() {
  const rehydrateForm = makeRehydrateForm();
  return function mapStateToProps(state, props) {
    return {
      externalData: getExternalData(state, props),
      form: rehydrateForm(state, props),
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
