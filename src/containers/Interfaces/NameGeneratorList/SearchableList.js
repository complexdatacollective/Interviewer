import React from 'react';
import useSort from './useSort';
import useSearch from './useSearch';
import HyperList from './HyperList';

const EmptyComponent = () => (
  <div className="empty">
    No results...
  </div>
);

/**
  * SearchableList
  */
const SearchableList = ({
  columns,
  itemComponent,
  items,
  onDrop,
  // TODO: streamline these from protocol config - auto and list name gens
  sortableProperties,
  searchOptions,
}) => {
  const [results, query, setQuery, isWaiting] = useSearch(items, searchOptions);
  const [sortedResults,,, setSortByProperty] = useSort(results);

  const handleChangeSearch = (e) => {
    setQuery(e.target.value || '');
  };

  return (
    <div className="searchable-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      { sortableProperties.length > 0 && (
        <div className="searchable-list__sort">
          {sortableProperties.map(({ variable, label }) => (
            <button onClick={() => setSortByProperty(variable)} type="button">
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="searchable-list__list" style={{ flex: 1, display: 'flex' }}>
        { isWaiting && (
          <div className="searchable-list__waiting">Searching...</div>
        )}
        { !isWaiting && (
          <HyperList
            items={sortedResults}
            itemComponent={itemComponent}
            columns={columns}
            emptyComponent={EmptyComponent}
            onDrop={onDrop}
          />
        )}
      </div>
      <div className="searchable-list__search">
        <input type="text" value={query} onChange={handleChangeSearch} />
      </div>
    </div>
  );
};

SearchableList.propTypes = {
};

SearchableList.defaultProps = {
  columns: undefined,
  itemComponent: null,
  items: [],
  sortableProperties: [],
  searchOptions: {},
};

export default SearchableList;
