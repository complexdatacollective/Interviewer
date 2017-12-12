import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';

import SearchResult from './SearchResult';

const SearchResults = ({ results, displayKey, onSelectResult }) => {
  function searchResult(resultData, id) {
    return (
      <SearchResult
        key={`search__result_${id}`}
        data={resultData}
        displayKey={displayKey}
        onClick={onSelectResult}
      />
    );
  }

  let content;
  if (results.length) {
    content = results.map(searchResult);
  } else {
    content = (<p>Nothing matching that search</p>);
  }

  return (
    <CSSTransitionGroup
      component="div"
      className="search__results"
      transitionName="search__results--transition"
      transitionEnterTimeout={2000}
      transitionLeaveTimeout={2000}
    >
      <p>results:</p>
      {content}
    </CSSTransitionGroup>
  );
};

SearchResults.propTypes = {
  results: PropTypes.array.isRequired,
  displayKey: PropTypes.string.isRequired,
  onSelectResult: PropTypes.func.isRequired,
};

export default SearchResults;
