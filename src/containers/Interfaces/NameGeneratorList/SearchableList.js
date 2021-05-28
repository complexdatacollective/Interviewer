import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../../components/Loading';
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
  itemType,
  accepts,
  onDrop,
  // TODO: streamline these from protocol config - auto and list name gens
  sortableProperties,
  searchOptions,
}) => {
  const [results, query, setQuery, isWaiting] = useSearch(items, searchOptions);
  const [sortedResults,sortByProperty,sortDirection, setSortByProperty] = useSort(results);

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

              {variable === sortByProperty && (
                sortDirection
              )}
            </button>
          ))}
        </motion.div>
      )}
      <motion.div
        className="searchable-list__main"
        style={{ flex: 1, display: 'flex', position: 'relative' }}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          { isWaiting && (
            <motion.div
              className="searchable-list__waiting"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key="loading"
            >
              <Loading message="searching..." />
            </motion.div>
          )}
        </AnimatePresence>

        { !isWaiting && (
          <motion.div
            className="searchable-list__list"
            style={{ flex: 1, display: 'flex' }}
            // variants={variants}
            // initial="hidden"
            // animate="visible"
            // exit="hidden"
            key="list"
          >
            <HyperList
              items={sortedResults}
              itemComponent={itemComponent}
              columns={columns}
              emptyComponent={EmptyComponent}
              itemType={itemType}
              accepts={accepts}
              onDrop={onDrop}
            />
          </motion.div>
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
