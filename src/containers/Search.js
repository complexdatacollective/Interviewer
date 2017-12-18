import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'network-canvas-ui';

import AddCountButton from '../components/AddCountButton';
import SearchForm from './SearchForm';
import SearchResults from '../components/SearchResults';
import { actionCreators as searchActions } from '../ducks/modules/search';
import { makeGetFuse } from '../selectors/search';

/**
 * Fuse.js: approximate string matching.
 * See makeGetFuse() in the search selectors.
 */
const DefaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
};

/**
 * The `reselect` selector which provides a Fuse instance for searching.
 */
const FuseSelector = makeGetFuse(DefaultFuseOpts);

const InitialState = {
  hasInput: false,
  searchResults: [],
  searchTerm: null,
  selectedResults: [],
};

/**
  * Renders a plaintext node search interface in a semi-modal display,
  * with a single text input supporting autocomplete.
  *
  * Multiple results may be selected by the user, and the final collection
  * committed to an `onComplete()` handler.
  *
  * props.displayFields: An array of strings representing keys in each search set
  *     object. The first field is treated as the primary label and is required.
  * props.options:
  *   - matchProperties: An array of key names to search in the dataset
  *   - fuzzyness: How inexact search results may be, in the range [0,1].
  *     A value of zero requires an exact match. Large search sets may do better
  *     with smaller values (e.g., 0.2).
  *     Default: 0.5
  *
  */
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = InitialState;
  }

  onInputChange(changeset) {
    let searchResults;
    const newValue = changeset.searchTerm;
    const hasInput = newValue && newValue.length > 0;
    if (hasInput) {
      searchResults = this.props.fuse.search(newValue);
      searchResults = searchResults.filter(r => this.isAllowedResult(r));
    } else {
      searchResults = [];
    }
    this.setState({
      // TODO: Move searchResults to the SearchResults container state (or redux?).
      // ...manage selected results (selectedNodes) at this level.
      searchResults,
      searchTerm: newValue,
      hasInput: hasInput || false,
    });
  }

  onCommit() {
    this.props.onComplete(this.state.selectedResults);
    this.setState(InitialState);
  }

  toggleSelectedResult(result) {
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

  // Result is allowed if there is no excluded node that 'matches'
  // if true, suppress candidate from appearing in search results
  // example: node has already been selected.
  // Assumption:
  //   `excludedNodes` size is small, but search set may be large,
  //   and so preferable to filter found results dynamically.
  isAllowedResult(candidate) {
    // A search result is equal to a [excluded] node if all displayFields are equal
    const matchAttrs = this.props.displayFields;
    const isNotMatch = (result, node) => matchAttrs.some(attr => node[attr] !== result[attr]);

    return this.props.excludedNodes.every(excluded => isNotMatch(excluded, candidate));
  }

  render() {
    const {
      closeSearch,
      collapsed,
      displayFields,
    } = this.props;

    const searchClasses = cx(
      'search',
      {
        'search--collapsed': collapsed,
        'search--hasInput': this.state.hasInput,
      },
    );

    return (
      <div className={searchClasses}>
        <div className="search__content">
          <Icon name="close" size="40px" className="menu__cross" onClick={closeSearch} />

          <h1>Type in the box below to Search</h1>

          <SearchResults
            hasInput={this.state.hasInput}
            results={this.state.searchResults}
            selectedResults={this.state.selectedResults}
            onSelectResult={result => this.toggleSelectedResult(result)}
            displayFields={displayFields}
          />
          {
            this.state.selectedResults.length > 0 &&
            <AddCountButton
              count={this.state.selectedResults.length}
              onClick={() => this.onCommit()}
            />
          }

          <SearchForm
            searchValue={this.state.searchTerm}
            onChange={(event, newValue) => this.onInputChange(event, newValue)}
          />

        </div>
      </div>
    );
  }
}

Search.propTypes = {
  closeSearch: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  displayFields: PropTypes.array.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  fuse: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,

  // These props are required by the fuse selector
  /* eslint-disable react/no-unused-prop-types */
  dataSourceKey: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  /* eslint-enable react/no-unused-prop-types */
};

function mapDispatchToProps(dispatch) {
  return {
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
  };
}

function mapStateToProps(state, props) {
  return {
    collapsed: state.search.collapsed,
    fuse: FuseSelector(state, props),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
