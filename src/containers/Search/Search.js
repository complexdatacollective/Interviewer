import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'network-canvas-ui';

import SearchResults from './SearchResults';
import AddCountButton from '../../components/AddCountButton';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { makeGetFuse } from '../../selectors/search';
import { getNodePalette } from '../../utils/NodePalettes';

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
  searchTerm: '',
  selectedResults: [],
};

/**
  * @class Search
  * @extends Component
  *
  * @description
  * Renders a plaintext node search interface in a semi-modal display,
  * with a single text input supporting autocomplete.
  *
  * Multiple results may be selected by the user, and the final collection
  * committed to an `onComplete()` handler.
  *
  * Note: to ensure that search state is tied to a source data set, set a `key`
  * prop that uniquely identifies the source data.
  *
  * @param props.displayFields {array} - An array of strings representing keys
  *     in each search set object. The first field is treated as the primary
  *     label and is required.
  * @param props.options {object}
  * @param props.options.matchProperties {array} - one or more key names to search
  *     in the dataset
  * @param [props.options.fuzzyness=0.5] {number} -
  *     How inexact search results may be, in the range [0,1].
  *     A value of zero requires an exact match. Large search sets may do better
  *     with smaller values (e.g., 0.2).
  *
  */
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = InitialState;
  }

  onInputChange(newValue) {
    let searchResults;
    const hasInput = newValue && newValue.length > 0;

    if (hasInput) {
      searchResults = this.props.fuse.search(newValue);
      searchResults = searchResults.filter(r => this.isAllowedResult(r));
      searchResults = searchResults.map(r => this.withUid(r));
    } else {
      searchResults = [];
    }
    this.setState({
      searchResults,
      searchTerm: newValue,
      hasInput: hasInput || false,
    });
  }

  onClose() {
    if (this.props.clearResultsOnClose) {
      this.setState(InitialState);
    }
    this.props.closeSearch();
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

  /**
   * A result is considered unique only if it presents some disambiguating
   * information to the user (i.e., its combination of display attributes is unique).
   *
   * If the protocol defines a `uid` attribute, that will be used instead
   * (and assumed to be unique).
   *
   * @param  {object} result A search result
   * @return {string} a unique identifier for the result
   */
  uidForResult(result) {
    if (result.uid) {
      return result.uid;
    }
    return this.props.displayFields.map(field => result[field]).join('.');
  }

  withUid(result) {
    if (result.uid) {
      return result;
    }
    return { ...result, uid: this.uidForResult(result) };
  }

  // See uniqueness discussion at uidForResult.
  // If false, suppress candidate from appearing in search results —
  // for example, if the node has already been selected.
  // Assumption:
  //   `excludedNodes` size is small, but search set may be large,
  //   and so preferable to filter found results dynamically.
  isAllowedResult(candidate) {
    const uid = this.uidForResult.bind(this);
    const candidateUid = uid(candidate);
    return this.props.excludedNodes.every(excluded => uid(excluded) !== candidateUid);
  }

  render() {
    const {
      collapsed,
      displayFields,
      nodeType,
    } = this.props;

    const hasInput = this.state.hasInput;
    const searchClasses = cx(
      'search',
      {
        'search--collapsed': collapsed,
        'search--hasInput': hasInput,
      },
    );

    const addButtonAlt = getNodePalette(nodeType);

    const SearchPrompt = 'Type in the box below to Search';
    const SelectPrompt = 'Tap an item to select it';

    const HeaderClass = 'search__header';
    const Headers = [SearchPrompt, SelectPrompt].map((prompt, i) => {
      let hiddenClass = '';
      if ((prompt === SearchPrompt && hasInput) ||
        (prompt === SelectPrompt && !hasInput)) {
        hiddenClass = `${HeaderClass}--hidden`;
      }
      return (<h1 className={`${HeaderClass} ${hiddenClass}`} key={`${HeaderClass}${i}`}>
        {prompt}
      </h1>);
    });

    // Result formatters:
    const primaryDisplayField = displayFields[0];
    const auxFields = displayFields.slice(1);

    const toDetail = (result, field) => ({ [field]: result[field] });
    const getLabel = result => result[primaryDisplayField];
    const getSelected = result => this.state.selectedResults.indexOf(result) > -1;
    const getDetails = result => auxFields.map(field => toDetail(result, field));

    return (
      <div className={searchClasses}>
        <form className="search__content">
          <Icon name="close" size="40px" className="menu__cross" onClick={evt => this.onClose(evt)} />

          {Headers}

          <SearchResults
            hasInput={hasInput}
            results={this.state.searchResults}

            label={getLabel}
            details={getDetails}
            selected={getSelected}
            onToggleCard={item => this.toggleSelectedResult(item)}
          />

          {
            this.state.selectedResults.length > 0 &&
            <AddCountButton
              count={this.state.selectedResults.length}
              altClass={addButtonAlt}
              onClick={() => this.onCommit()}
            />
          }

          <input
            className="search__input"
            onChange={evt => this.onInputChange(evt.target.value)}
            name="searchTerm"
            value={this.state.searchTerm}
            type="search"
          />

        </form>
      </div>
    );
  }
}

Search.defaultProps = {
  clearResultsOnClose: true,
  nodeType: '',
};

Search.propTypes = {
  clearResultsOnClose: PropTypes.bool,
  closeSearch: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  displayFields: PropTypes.array.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  fuse: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  nodeType: PropTypes.string,

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
