import React from 'react';
import useSort from './useSort';
import useSearch from './useSearch';
import HyperList from './HyperList';

/**
  * SearchableList
  */
const SearchableList = ({
  columns,
  itemComponent,
  items,
  // TODO: streamline these from protocol config - auto and list name gens
  sortableProperties,
  searchOptions,
}) => {
  const [results, query, setQuery] = useSearch(items, searchOptions);
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
        <HyperList
          items={sortedResults}
          itemComponent={itemComponent}
          columns={columns}
        />
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
