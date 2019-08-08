/* eslint-disable react/sort-comp */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from '../../ui/components';
import SearchTransition from '../../components/Transition/Search';
import SearchResults from '../../containers/Search/SearchResults';
import AddCountButton from '../../components/AddCountButton';
import SearchButton from '../../components/Search/SearchButton';
import Loading from '../../components/Loading';

const formSubmitHandler = (e) => { e.preventDefault(); };

const Search = ({
  isOpen,
  nodeColor,
  getCardTitle,
  nodeIconName,
  isLoading,
  hasSearchTerm,
  awaitingResults,
  searchResults,
  searchTerm,
  getDetails,
  getIsSelected,
  onToggleSearch,
  onClose,
  onCommit,
  onQueryChange,
  onSelectResult,
  selectedResults,
}) => {
  if (isLoading) {
    return <Loading className="search__loading" message="Loading roster data..." />;
  }

  const searchClasses = cx('search', { 'search--hasInput': hasSearchTerm });

  const SearchPrompt = 'Type in the box below to Search';
  const SelectPrompt = 'Tap an item to select it';

  // Render both headers to allow transitions between them
  const HeaderClass = 'search__header';
  const headers = [SearchPrompt, SelectPrompt]
    .map((prompt, i) => {
      let hiddenClass = '';
      if ((prompt === SearchPrompt && hasSearchTerm) ||
        (prompt === SelectPrompt && !hasSearchTerm)) {
        hiddenClass = `${HeaderClass}--hidden`;
      }
      return (<h2 className={`${HeaderClass} ${hiddenClass}`} key={`${HeaderClass}${i}`}>
        {prompt}
      </h2>);
    });

  return (
    <React.Fragment>
      <SearchButton
        nodeIconName={nodeIconName}
        onClick={onToggleSearch}
        searchIsOpen={isOpen}
      />

      <SearchTransition
        className={searchClasses}
        in={isOpen}
      >
        <form onSubmit={formSubmitHandler}>
          <Icon name="close" className="menu__cross search__close-button" onClick={onClose} />

          {headers}

          <SearchResults
            hasInput={hasSearchTerm}
            awaitingResults={awaitingResults}
            results={searchResults}
            label={getCardTitle}
            details={getDetails}
            isItemSelected={getIsSelected}
            onItemClick={onSelectResult}
          />

          {
            selectedResults.length > 0 &&
            <AddCountButton
              count={selectedResults.length}
              colorName={nodeColor}
              onClick={onCommit}
            />
          }

          <input
            className="search__input"
            onChange={onQueryChange}
            name="searchTerm"
            value={searchTerm}
            type="search"
            disabled={isLoading}
          />
        </form>
      </SearchTransition>
    </React.Fragment>
  );
};

Search.defaultProps = {
};

Search.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  nodeColor: PropTypes.string.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasSearchTerm: PropTypes.bool.isRequired,
  awaitingResults: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  searchResults: PropTypes.array.isRequired,
  selectedResults: PropTypes.array.isRequired,
  getCardTitle: PropTypes.func.isRequired,
  getDetails: PropTypes.func.isRequired,
  getIsSelected: PropTypes.func.isRequired,
  onToggleSearch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onSelectResult: PropTypes.func.isRequired,
};

export default Search;
