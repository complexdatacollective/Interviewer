import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@codaco/ui';
import SearchIcon from '@material-ui/icons/SearchRounded';
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
    No results.
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
  const [sortedResults, sortByProperty, sortDirection, setSortByProperty] = useSort(results);

  const handleChangeSearch = (e) => {
    setQuery(e.target.value || '');
  };

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
        <AnimatePresence>
          { isWaiting && (
            <motion.div
              className="searchable-list__waiting"
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
