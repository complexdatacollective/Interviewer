import React from 'react';
import { motion } from 'framer-motion';
import useSort from './useSort';
import useSearch from './useSearch';
import HyperList from './HyperList';

const variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

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
        <motion.div
          className="searchable-list__sort"
          variants={variants}
          initial="hidden"
          animate="visible"
        >
          {sortableProperties.map(({ variable, label }) => (
            <button
              onClick={() => setSortByProperty(variable)}
              type="button"
              key={variable}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
      <motion.div
        className="searchable-list__list"
        style={{ flex: 1, display: 'flex' }}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        { isWaiting && (
          <motion.div
            className="searchable-list__waiting"
            variants={variants}
            initial="hidden"
            animate="visible"
          >
            Searching...
          </motion.div>
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
      </motion.div>
      <motion.div
        className="searchable-list__search"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <input type="text" value={query} onChange={handleChangeSearch} />
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
