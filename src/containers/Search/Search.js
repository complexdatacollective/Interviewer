import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { debounce } from 'lodash';
import { Icon } from '../../ui/components';
import SearchTransition from '../../components/Transition/Search';
import SearchResults from './SearchResults';
import AddCountButton from '../../components/AddCountButton';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { getEntityAttributes, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { makeGetFuse } from '../../selectors/search';
import withExternalData from '../withExternalData';
import getParentKeyByNameValue from '../../utils/getParentKeyByNameValue';

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
  * @param {string} getCardTitle The attribute to use for rendering a result
  * @param props.details {array} - An array of objects shaped
  *     `{label: '', variable: ''}` in each search set object.
  * @param props.options {object}
  * @param props.options.matchProperties {array} - one or more key names to search
  *     in the dataset. Supports nested properties using dot notation.
  *     Example:
  *       data = [{ id: '', attribtues: { name: '' }}];
  *       matchProperties = ['attributes.name'];
  * @param [props.options.fuzziness=0.5] {number} -
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

  onComponentWillUnmount() {
    this.updateResults.cancel();
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

  search(query) {
    if (query.length === 0) {
      return [];
    }

    const searchResults = this.props.fuse.search(query);
    return searchResults.filter(r => this.isAllowedResult(r));
  }

  updateResults = debounce((query) => {
    this.setState({
      searchResults: this.search(query),
      awaitingResults: false,
    });
  }, 1500); // 'simulate' deeper search for better ux?

  handleQueryChange = (e) => {
    const query = e.target.value;

    this.setState({
      searchTerm: query,
      hasInput: query.length !== 0,
      searchResults: [],
      awaitingResults: true,
    });

    this.updateResults(query);
  };

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

  // If false, suppress candidate from appearing in search results —
  // for example, if the node has already been selected.
  // Assumption:
  //   `excludedNodes` size is small, but search set may be large,
  //   and so preferable to filter found results dynamically.
  isAllowedResult(candidate) {
    return this.props.excludedNodes.every(excluded =>
      excluded[entityPrimaryKeyProperty] !== candidate[entityPrimaryKeyProperty]);
  }

  render() {
    const {
      details,
      className,
      collapsed,
      nodeColor,
      getCardTitle,
    } = this.props;

    const hasInput = this.state.hasInput;
    const searchClasses = cx(
      className,
      'search',
      {
        'search--hasInput': hasInput,
      },
    );

    const SearchPrompt = 'Type in the box below to Search';
    const SelectPrompt = 'Tap an item to select it';

    // Render both headers to allow transitions between them
    const HeaderClass = 'search__header';
    const Headers = [SearchPrompt, SelectPrompt].map((prompt, i) => {
      let hiddenClass = '';
      if ((prompt === SearchPrompt && hasInput) ||
        (prompt === SelectPrompt && !hasInput)) {
        hiddenClass = `${HeaderClass}--hidden`;
      }
      return (<h2 className={`${HeaderClass} ${hiddenClass}`} key={`${HeaderClass}${i}`}>
        {prompt}
      </h2>);
    });


    // Result formatters:
    const toDetail = (node, field) => {
      const nodeTypeVariables = this.props.nodeTypeDefinition.variables;
      const labelKey = getParentKeyByNameValue(nodeTypeVariables, field.variable);
      return { [field.label]: getEntityAttributes(node)[labelKey] };
    };

    const getSelected = node => this.state.selectedResults.indexOf(node) > -1;
    const getDetails = node => details.map(attr => toDetail(node, attr));
    return (
      <SearchTransition
        className={searchClasses}
        in={!collapsed}
      >
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <Icon name="close" className="menu__cross search__close-button" onClick={evt => this.onClose(evt)} />

          {Headers}

          <SearchResults
            hasInput={hasInput}
            awaitingResults={this.state.awaitingResults}
            results={this.state.searchResults}
            label={getCardTitle}
            details={getDetails}
            isItemSelected={getSelected}
            onItemClick={item => this.toggleSelectedResult(item)}
          />

          {
            this.state.selectedResults.length > 0 &&
            <AddCountButton
              count={this.state.selectedResults.length}
              colorName={nodeColor}
              onClick={() => this.onCommit()}
            />
          }

          <input
            className="search__input"
            onChange={this.handleQueryChange}
            name="searchTerm"
            value={this.state.searchTerm}
            type="search"
          />
        </form>
      </SearchTransition>
    );
  }
}

Search.defaultProps = {
  details: [],
  className: '',
  clearResultsOnClose: true,
  nodeColor: '',
  options: {},
};

Search.propTypes = {
  details: PropTypes.array,
  className: PropTypes.string,
  clearResultsOnClose: PropTypes.bool,
  closeSearch: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  getCardTitle: PropTypes.func.isRequired,
  excludedNodes: PropTypes.array.isRequired,
  fuse: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  nodeColor: PropTypes.string,
  nodeTypeDefinition: PropTypes.object.isRequired,
  /* eslint-disable react/no-unused-prop-types */
  // These props are required by the fuse selector
  dataSourceKey: PropTypes.string.isRequired,
  options: PropTypes.object,
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

export { Search };

export default compose(
  withExternalData('dataSourceKey', 'externalData'),
  connect(mapStateToProps, mapDispatchToProps),
)(Search);
