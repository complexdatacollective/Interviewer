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
  * Renders a plaintext search interface in a semi-modal display,
  * with a single text input supporting autocomplete.
  *
  * props.options:
  *   - matchProperties: An array of key names to search in the dataset
  *   - fuzzyness: How inexact search results may be, in the range [0,1].
  *     A value of zero requires an exact match. Large search sets may do better
  *     with smaller values (e.g., 0.2).
  *     Default: 0.5
  *
  */
// TODO: less generic name
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasInput: false,
      searchResults: [],
      searchTerm: '',
      selectedResults: [],
    };
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
      searchResults,
      searchTerm: newValue,
      hasInput: hasInput || false,
    });
  }

  onCommit() {
    // TODO: redux? This is sort of a one-shot handler; caller should parse and then discard.
    // But would be nice to have management (i.e., clearing results)
    this.props.onComplete(this.state.selectedResults);
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

  // Result is allowed if there is no excluded node that 'matches'
  // if true, suppress candidate from appearing in search results
  // example: node has already been selected.
  // TODO: Performance?
  //   I'm assuming that excludedNodes size is small, but search set may be large,
  //   and so preferable to filter found results dynamically. Could cache as well.
  isAllowedResult(candidate) {
    // A search result is equal to a [excluded] node if all displayFields are equal
    // TODO: I'm assuming sufficient since user would have no way to distinguish.
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

    // TODO: real input integration. Investigate slowness.
    return (
      <div className={searchClasses}>
        <div className="search__content">
          <Icon name="close" size="40px" className="menu__cross" onClick={closeSearch} />

          <h1>Type in the box below to Search</h1>

          <SearchResults
            hasInput={this.state.hasInput}
            results={this.state.searchResults}
            selectedResults={this.state.selectedResults}
            displayKey={displayFields[0]}
            onSelectResult={result => this.onSelectResult(result)}
          />
          {
            /* TODO: move to form (submit)? */
            this.state.selectedResults.length > 0 &&
            <AddCountButton
              count={this.state.selectedResults.length}
              onClick={() => this.onCommit()}
            />
          }

          <SearchForm onChange={(event, newValue) => this.onInputChange(event, newValue)} />

        </div>
      </div>
    );
  }
}

Search.propTypes = {
  closeSearch: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  displayFields: PropTypes.array.isRequired,
  // TODO: is `Nodes` general enough for search (naming)?
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
  const getFuse = makeGetFuse(DefaultFuseOpts);
  return {
    // TODO: define this in selectors/search
    collapsed: state.search.collapsed,
    fuse: getFuse(state, props),
    // searchData: getSearchData(state, props),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
