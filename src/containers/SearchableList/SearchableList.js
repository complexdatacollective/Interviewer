import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const formatResults = (results, { mode, hasQuery }) => {
  if (mode === modes.SMALL) { return results; }
  if (!hasQuery) { return null; }
  return results;
};

const EmptyComponent = () => (
  <div className="empty">
    No results.
  </div>
);

const SearchingPlaceholder = () => (
  <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Loading message="searching..." />
  </div>
);

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

  const formattedResults = formatResults(sortedResults, { mode, hasQuery });

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
          items={formattedResults}
          dynamicProperties={dynamicProperties}
          itemComponent={itemComponent}
          columns={columns}
          emptyComponent={EmptyComponent}
          // placeholder={<SearchingPlaceholder />}
          placeholder={(isWaiting ? <SearchingPlaceholder /> : null)}
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
