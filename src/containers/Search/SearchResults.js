import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Loading from '../../components/Loading';
import CardList from '../../components/CardList';

// This provides a workaround for visibility when a softkeyboard scrolls the viewport
// (for example, on iOS). TODO: better solution once animation is in place.
function styleForSoftKeyboard() {
  let style = {};
  const scrollTop = window.pageYOffset || window.scrollY || 0;
  if (scrollTop > 0) {
    style = {
      height: `calc(100% - 320px - ${scrollTop}px)`,
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
class SearchResults extends Component {
  getResults() {
    const {
      hasInput,
      awaitingResults,
      results,
      ...rest
    } = this.props;

    if (awaitingResults) {
      return <Loading message="Performing search..." />;
    }

    if (results && results.length) {
      return (
        <CardList
          className="card-list--single"
          items={results}
          {...rest}
        />
      );
    }

    if (hasInput) {
      return (<p>Nothing matching that search</p>);
    }

    return null;
  }

  render() {
    const {
      hasInput,
    } = this.props;

    const style = styleForSoftKeyboard();

    const classNames = cx(
      'search__results',
      { 'search__results--collapsed': !hasInput },
    );

    return (
      <div className={classNames} style={style}>
        {this.getResults()}
      </div>
    );
  }
}

SearchResults.propTypes = {
  hasInput: PropTypes.bool.isRequired,
  results: PropTypes.array.isRequired,
};

export default SearchResults;
