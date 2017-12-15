import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Scroller from './Scroller';
import SearchResult from './SearchResult';

// class SearchResults extends Component {
const SearchResults = (props) => {
  const {
    hasInput,
    results,
    displayKey,
    onSelectResult,
    selectedResults,
  } = props;

  const classNames = cx(
    'search__results',
    { 'search__results--collapsed': !hasInput },
  );

  function toSearchResult(resultData, id) {
    const isSelected = selectedResults.indexOf(resultData) > -1;
    return (
      <SearchResult
        key={`search__result_${id}`}
        data={resultData}
        displayKey={displayKey}
        onClick={onSelectResult}
        isSelected={isSelected}
      />
    );
  }

  let content;
  if (results.length) {
    content = results.map(toSearchResult);
  } else {
    content = (<p>Nothing matching that search</p>);
  }

  return (
    <div className={classNames}>
      <Scroller>
        <p>results:</p>
        {content}
      </Scroller>
    </div>
  );
};

SearchResults.propTypes = {
  displayKey: PropTypes.string.isRequired,
  hasInput: PropTypes.bool.isRequired,
  onSelectResult: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  // TODO: move into redux store?
  selectedResults: PropTypes.array.isRequired,
};

export default SearchResults;
