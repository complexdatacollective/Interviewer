import React from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import SearchIcon from '@material-ui/icons/SearchRounded';
import Loading from '../../components/Loading';
import Panel from '../../components/Panel';
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

const getPlaceholder = ({ isWaiting }) => {
  if (isWaiting) {
    return (
      <div className="searchable-list__placeholder">
        <Loading message="searching..." />
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

  const showTooMany = mode === modes.LARGE && !hasQuery;
  const canSort = sortableProperties.length > 0;

  const listClasses = cx(
    'searchable-list__list',
    { 'searchable-list__list--can-sort': canSort },
  );

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="searchable-list"
    >
      <Panel
        title="Available to add"
        noHighlight
        noCollapse
      >
        <div className={listClasses}>
          <HyperList
            items={sortedResults}
            dynamicProperties={dynamicProperties}
            itemComponent={itemComponent}
            columns={columns}
            emptyComponent={EmptyComponent}
            placeholder={placeholder}
            itemType={itemType}
            accepts={accepts}
            onDrop={onDrop}
          />
          { showTooMany && (
            <div className="searchable-list__too-many">
              <h2>Too many to display. Filter the list below, to see results.</h2>
            </div>
          )}
        </div>
        { canSort && (
          <div className="searchable-list__sort">
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
          </div>
        )}
        <div className="searchable-list__search">
          <input
            type="text"
            placeholder="Enter a search term..."
            value={query}
            onChange={handleChangeSearch}
            onFocus={handleFocusSearch}
          />
          <div className="searchable-list__search-icon"><SearchIcon color="primary" /></div>
        </div>
      </Panel>
    </motion.div>
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
