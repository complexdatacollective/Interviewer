import React, { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { sortBy, get } from 'lodash/fp';
import HyperList from './HyperList';

const defaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true, // Break up query so it can match across different fields
  keys: ['props.label'], // fix this
};

const getFuseOptions = (options) => {
  const threshold = typeof options.fuzziness !== 'number'
    ? defaultFuseOpts.threshold
    : options.fuzziness;

  return {
    ...defaultFuseOpts,
    // keys: options.matchProperties,
    threshold,
  };
};

const useSearch = (list, options) => {
  const fuse = useMemo(
    () => new Fuse(list, getFuseOptions(options)),
    [list, options],
  );

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(list);

  useEffect(() => {
    if (query.length <= 1) {
      setResults(list);
      return;
    }

    setResults(fuse.search(query));
  }, [fuse, query]);

  return [results, query, setQuery];
};

const sorter = (property) => (item) => get(item, ['data', property]);

const useSort = (list, initialSortBy, initialDirection = 'desc') => {
  const [sortByProperty, setSortByProperty] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const toggleSortDirection = () => setSortDirection(
    (d) => (d === 'desc' ? 'asc' : 'desc'),
  );

  const updateSortByProperty = (property) => {
    if (property === sortByProperty) {
      toggleSortDirection();
      return;
    }

    setSortByProperty(property);
    setSortDirection('desc');
  };

  const sortedList = useMemo(() => {
    if (!sortByProperty) { return list; }
    return sortDirection === 'desc'
      ? sortBy([sorter(sortByProperty)])(list)
      : sortBy([sorter(sortByProperty)])(list).reverse();
  }, [list, sortByProperty, sortDirection]);

  return [sortedList, sortByProperty, sortDirection, updateSortByProperty, toggleSortDirection];
};

/**
  * SearchableList
  */
const SearchableList = ({
  columns,
  itemComponent,
  items,
  rowHeight,
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
          rowHeight={rowHeight}
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
  rowHeight: undefined,
  itemComponent: null,
  items: [],
  sortableProperties: [],
  searchOptions: {},
};

export default SearchableList;
