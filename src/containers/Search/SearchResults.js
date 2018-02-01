import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import CardList from '../../components/CardList';

// This provides a workaround for visibility when a softkeyboard scrolls the viewport
// (for example, on iOS). TODO: better solution once animation is in place.
function styleForSoftKeyboard() {
  let style = {};
  const scrollTop = window.pageYOffset || window.scrollY || 0;
  if (scrollTop > 0) {
    style = {
      height: `calc(100vh - 320px - ${scrollTop}px)`,
      minHeight: '10em',
    };
  }
  return style;
}

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

  const style = styleForSoftKeyboard();

  const classNames = cx(
    'search__results',
    { 'search__results--collapsed': !hasInput },
  );

  let content = '';
  if (results.length) {
    content = (
      <CardList
        className="card-list--single"
        nodes={results}
        {...rest}
      />
    );
  } else if (hasInput) {
    content = (<p>Nothing matching that search</p>);
  }

  return (
    <div className={classNames} style={style}>
      {content}
    </div>
  );
};

SearchResults.propTypes = {
  hasInput: PropTypes.bool.isRequired,
  results: PropTypes.array.isRequired,
};

export default SearchResults;
