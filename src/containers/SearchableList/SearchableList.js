import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import SearchIcon from '@material-ui/icons/SearchRounded';
import Loading from '../../components/Loading';
import useSortableProperties from './useSortableProperties';
import useSort from './useSort';
import useSearch from './useSearch';
import HyperList from '../HyperList';

const modes = {
  LARGE: 'LARGE',
  SMALL: 'SMALL',
};

const variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const EmptyComponent = () => (
  <div className="searchable-list__placeholder">
    No results.
  </div>
);

const getPlaceholder = ({ mode, isWaiting, hasQuery }) => {
  if (isWaiting) {
    return (
      <div className="searchable-list__placeholder">
        <Loading message="searching..." />
      </div>
    );
  }
  if (mode === modes.LARGE && !hasQuery) {
    return (
      <div className="searchable-list__placeholder searchable-list__placeholder--dimmed">
        <p>Plase enter your search below.</p>
      </div>
    );
  }
  return null;
};

/**
  * SearchableList
  */
const SearchableList = ({
  columns,
  itemComponent,
  items,
  itemType,
  dynamicProperties,
  accepts,
  onDrop,
  sortOptions,
  searchOptions,
}) => {
  const [results, query, setQuery, isWaiting, hasQuery] = useSearch(items, searchOptions);

  const [sortableProperties, initialSortOrder] = useSortableProperties(sortOptions);

  const [
    sortedResults,
    sortByProperty,
    sortDirection,
    setSortByProperty,
  ] = useSort(results, initialSortOrder);

  const handleChangeSearch = (e) => {
    setQuery(e.target.value || '');
  };

  const handleFocusSearch = () => {
    setQuery('');
  };

  const mode = items.length > 100 ? modes.LARGE : modes.SMALL;

  const placeholder = getPlaceholder({ mode, isWaiting, hasQuery });

  return (
    <div className="searchable-list">
      { sortableProperties.length > 0 && (
        <motion.div
          className="searchable-list__sort"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          {sortableProperties.map(({ variable, label }) => (
            <Button
              onClick={() => setSortByProperty(variable)}
              type="button"
              key={variable}
            >
              {label}

              {variable === sortByProperty && (
                sortDirection === 'asc' ? ' \u25B2' : ' \u25BC'
              )}
            </Button>
          ))}
        </motion.div>
      )}
      <motion.div
        className="searchable-list__main"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <HyperList
          items={results}
          dynamicProperties={dynamicProperties}
          itemComponent={itemComponent}
          columns={columns}
          emptyComponent={EmptyComponent}
          placeholder={placeholder}
          itemType={itemType}
          accepts={accepts}
          onDrop={onDrop}
        />
      </motion.div>
      <motion.div
        className="searchable-list__search"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <input
          type="text"
          placeholder="Enter a search term..."
          value={query}
          onChange={handleChangeSearch}
          onFocus={handleFocusSearch}
        />
        <div className="searchable-list__search-icon"><SearchIcon color="primary" /></div>
      </motion.div>
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
