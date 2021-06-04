import React, { useMemo } from 'react';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { isEqual } from 'lodash';
import { Button } from '@codaco/ui';
import Search from '@codaco/ui/lib/components/Fields/Search';
import Loading from '../components/Loading';
import Panel from '../components/Panel';
import useSort from '../hooks/useSort';
import useSearch from '../hooks/useSearch';
import HyperList from './HyperList';

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

/**
  * SearchableList
  *
  * This adds UI around the HyperList component which enables
  * sorting and searching.
  */
const SearchableList = ({
  accepts,
  columns,
  dynamicProperties,
  excludeItems,
  itemComponent,
  items,
  itemType,
  onDrop,
  searchOptions,
  sortOptions,
}) => {
  const [results, query, setQuery, isWaiting, hasQuery] = useSearch(items, searchOptions);

  const [
    sortedResults,
    sortByProperty,
    sortDirection,
    setSortByProperty,
  ] = useSort(results, sortOptions.initialSortOrder);

  const filteredResults = useMemo(
    () => {
      if (!excludeItems || !sortedResults) { return sortedResults; }
      return sortedResults.filter(({ id }) => !excludeItems.includes(id));
    },
    [sortedResults, excludeItems],
  );

  const handleChangeSearch = (e) => {
    setQuery(e.target.value || '');
  };

  const handleFocusSearch = () => {
    setQuery('');
  };

  const mode = items.length > 100 ? modes.LARGE : modes.SMALL;

  const placeholder = isWaiting
    ? (
      <div className="searchable-list__placeholder">
        <Loading message="searching..." />
      </div>
    ) : null;

  const showTooMany = mode === modes.LARGE && !hasQuery;
  const canSort = sortOptions.sortableProperties.length > 0;

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
            items={filteredResults}
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
            {sortOptions.sortableProperties.map(({ variable, label }) => {
              const isActive = isEqual(variable, sortByProperty);
              const color = isActive ? 'primary' : 'platinum';
              return (
                <Button
                  onClick={() => setSortByProperty(variable)}
                  type="button"
                  key={variable}
                  color={color}
                >
                  {label}

                  {isActive && (
                    sortDirection === 'asc' ? ' \u25B2' : ' \u25BC'
                  )}
                </Button>
              );
            })}
          </div>
        )}
        <div className="searchable-list__search">
          <Search
            placeholder="Enter a search term..."
            input={{
              value: query,
              onChange: handleChangeSearch,
              onFocus: handleFocusSearch,
            }}
          />
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
  searchOptions: {},
  sortableProperties: [],
  dynamicProperties: {},
  excludeItems: [],
};

export default SearchableList;
