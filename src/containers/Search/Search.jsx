/* eslint-disable react/sort-comp */

import {
  compose, withStateHandlers, withHandlers, defaultProps,
} from 'recompose';
import { connect } from 'react-redux';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { getEntityAttributes } from '../../ducks/modules/network';
import getParentKeyByNameValue from '../../utils/getParentKeyByNameValue';
import Search from '../../components/Search/Search';
import withExternalData from '../withExternalData';
import withSearch from './withSearch';

// eslint-disable-next-line
const mapStateToProps = ({ search }, { externalData__isLoading }) => ({
  isOpen: !search.collapsed,
  isLoading: externalData__isLoading,
});

const mapDispatchToProps = {
  toggleSearch: searchActions.toggleSearch,
  closeSearch: searchActions.closeSearch,
};

const withReduxState = connect(mapStateToProps, mapDispatchToProps);

const initialState = {
  hasSearchTerm: false,
  searchResults: [],
  searchTerm: '',
  selectedResults: [],
  awaitingResults: false,
};

const withSearchState = withStateHandlers(
  () => ({ ...initialState }),
  {
    resetState: () => () => ({ ...initialState }),
    setQuery: () => (query) => ({
      searchTerm: query,
      hasSearchTerm: query.length !== 0,
      searchResults: [],
      awaitingResults: true,
    }),
    setResults: () => (results) => ({
      searchResults: results,
      awaitingResults: false,
    }),
    setSelected: (previousState) => (result) => {
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
    },
  },
);

const withSearchHandlers = withHandlers({
  onToggleSearch: ({ toggleSearch }) => () => toggleSearch(),

  onClose: ({ clearResultsOnClose, closeSearch, resetState }) => () => {
    if (clearResultsOnClose) {
      resetState();
    }

    closeSearch();
  },

  onCommit: ({
    onComplete, selectedResults, closeSearch, resetState,
  }) => () => {
    onComplete(selectedResults);
    closeSearch();
    resetState();
  },

  onQueryChange: ({ setQuery, search }) => (e) => {
    const query = e.target.value;

    setQuery(query);

    search(query);
  },

  onSelectResult: ({ setSelected }) => (result) => setSelected(result),

  getIsSelected: ({ selectedResults }) => (node) => selectedResults.indexOf(node) > -1,

  getDetails: ({ details, nodeTypeDefinition }) => {
    const toDetail = (node, field) => {
      const nodeTypeVariables = nodeTypeDefinition.variables;
      const labelKey = getParentKeyByNameValue(nodeTypeVariables, field.variable);
      return { [field.label]: getEntityAttributes(node)[labelKey] };
    };

    return (node) => details.map((attr) => toDetail(node, attr));
  },
});

const withDefaultProps = defaultProps({
  details: [],
  className: '',
  clearResultsOnClose: true,
  nodeColor: '',
  options: {},
});

/**
  * @class Search
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
export default compose(
  withDefaultProps,
  withExternalData('dataSourceKey', 'externalData'),
  withReduxState,
  withSearchState,
  withSearch,
  withSearchHandlers,
)(Search);
