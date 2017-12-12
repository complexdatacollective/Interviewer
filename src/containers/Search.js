import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, animation } from 'network-canvas-ui';

import Form from './Form';
import SearchResults from '../components/SearchResults';
import { actionCreators as searchActions } from '../ducks/modules/search';
import { getExternalData } from '../selectors/protocol';

/**
  * Renders a search interface in a semi-modal display
  * Supports selecting multiple...
  */
// TODO: less generic name
// TODO: container?
// const Search = ({ /*children,*/ collapsed }) => {
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      searchTerm: '',
      selectedResults: [],
    };
    this.searchOptions = props.options;
    this.searchDataNodes = props.externalData[props.dataSourceKey].nodes;
  }

  onChange(event, newValue) {
    let searchResults;
    if (newValue.length > 0) {
      searchResults = this.searchDataNodes.filter(node => this.isMatchingResult(newValue, node));
    } else {
      searchResults = [];
    }
    this.setState({
      searchResults,
      searchTerm: newValue,
      hasInput: newValue.length > 0,
      hasResults: searchResults.length > 0,
    });
  }

  onCommit() {
    this.props.completeSearch(this.state.selectedResults);
  }

  // TODO: "select" or "toggleSelected"?
  onSelectResult(result) {
    this.setState((previousState) => {
      let newResults;
      const existingIndex = previousState.selectedResults.indexOf(result);
      if (existingIndex > -1) {
        newResults = previousState.selectedResults.slice();
        newResults.splice(existingIndex, 1);
      } else {
        newResults = [...previousState.selectedResults, result];
      }
      return {
        selectedResults: newResults,
      };
    });
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

  render() {
    const { form, collapsed } = this.props;

    const searchClasses = cx(
      'search',
      { 'search--collapsed': collapsed },
    );

    return (
      <CSSTransitionGroup
        component="div"
        className={searchClasses}
        transitionName="search--transition"
        transitionEnterTimeout={animation.duration.fast}
        transitionLeaveTimeout={animation.duration.fast}
      >
        <h1>Type in the box below to Search</h1>

        {this.state.hasInput &&
          <SearchResults
            results={this.state.searchResults}
            displayKey={this.displayField}
            onSelectResult={result => this.onSelectResult(result)}
          />
        }

        <Form
          form={form.title}
          {...form}
          handleChange={(event, newValue) => this.onChange(event, newValue)}
        />

        <Button onClick={() => this.onCommit()}>
          Add all ({this.state.selectedResults.length})
        </Button>

      </CSSTransitionGroup>
    );
  }
}

Search.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  completeSearch: PropTypes.func.isRequired,
  externalData: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  dataSourceKey: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    completeSearch: bindActionCreators(searchActions.completeSearch, dispatch),
  };
}

function mapStateToProps(state, props) {
  return {
    externalData: getExternalData(state, props),
    // TODO: define this in selectors/search
    collapsed: state.search.collapsed,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
