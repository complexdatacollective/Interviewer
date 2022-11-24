/* eslint-disable react/sort-comp */

import {
  compose, withHandlers, lifecycle, withPropsOnChange,
} from 'recompose';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { LEGACY_makeGetFuse as makeGetFuse } from '../../selectors/search';

/**
 * Fuse.js: approximate string matching.
 * See makeGetFuse() in the search selectors.
 */
const DefaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true, // Break up query so it can match across different fields
};

/**
 * The `reselect` selector which provides a Fuse instance for searching.
 */
const FuseSelector = makeGetFuse(DefaultFuseOpts);

const mapStateToProps = (state, props) => ({
  fuse: FuseSelector(state, props),
});

const withReduxState = connect(mapStateToProps);

const withSearch = withHandlers({
  search: ({ fuse, excludedNodes, setResults }) => (query) => {
    if (query.length === 0) {
      setResults([]);
      return;
    }

    // If false, suppress candidate from appearing in search results —
    // for example, if the node has already been selected.
    // Assumption:
    //   `excludedNodes` size is small, but search set may be large,
    //   and so preferable to filter found results dynamically.
    const isAllowedResult = (candidate) => excludedNodes.every(
      (excluded) => excluded[entityPrimaryKeyProperty] !== candidate[entityPrimaryKeyProperty],
    );

    const searchResults = fuse.search(query);
    const results = searchResults.filter(isAllowedResult);

    setResults(results);
  },
});

const withLifecycle = lifecycle({
  onComponentWillUnmount: ({ search }) => () => search.cancel(), // cancel debounce when unmounting
});

export default compose(
  withReduxState,
  withSearch,
  withPropsOnChange(
    ['search'],
    ({ search }) => ({
      // TODO: Could use items length to determine debounce (e.g. loading) time
      search: debounce(search, 500), // simulate 'deeper' search for better ux?
    }),
  ),
  withLifecycle,
);
