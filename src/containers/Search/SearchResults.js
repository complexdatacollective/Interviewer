import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import CardList from '../../components/CardList';

/**
 * @class SearchResults
 * @extends Component
 *
 * @description
 * Thin wrapper to render {@link Search} component results in a CardList.
 *
 * @param props.hasInput {boolean} true if there is user input to the search component
 * @param props.results {array} the search results to render. See CardList for formatters.
 */
const SearchResults = (props) => {
  const {
    hasInput,
    results,
    ...rest
  } = props;

  const classNames = cx(
    'search__results',
    { 'search__results--collapsed': !hasInput },
  );

  let content;
  if (results.length) {
    content = (
      <CardList
        nodes={results}
        {...rest}
      />
    );
  } else {
    content = (<p>Nothing matching that search</p>);
  }

  return (
    <div className={classNames}>
      {content}
    </div>
  );
};

SearchResults.propTypes = {
  hasInput: PropTypes.bool.isRequired,
  results: PropTypes.array.isRequired,
};

export default SearchResults;
