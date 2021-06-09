import React, { useMemo, useRef } from 'react';
import uuid from 'uuid';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { isEqual, get } from 'lodash';
import { Button, Node } from '@codaco/ui';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import Search from '@codaco/ui/lib/components/Fields/Search';
import Loading from '../components/Loading';
import Panel from '../components/Panel';
import useSort from '../hooks/useSort';
import useSearch from '../hooks/useSearch';
import HyperList from './HyperList';
import useAnimationSettings from '../hooks/useAnimationSettings';
import useDropMonitor from '../behaviours/DragAndDrop/useDropMonitor';

const modes = {
  LARGE: 'LARGE',
  SMALL: 'SMALL',
};

const EmptyComponent = () => (
  <div className="searchable-list__placeholder">
    No results.
  </div>
);

const DropOverlay = ({ isOver, nodeColor }) => {
  const { duration } = useAnimationSettings();

  const variants = {
    visible: { opacity: 1, transition: { duration: duration.standard } },
    hidden: { opacity: 0, transition: { duration: duration.standard } },
  };

  const iconVariants = {
    over: {
      opacity: [1, 0.5],
      transition: { duration: duration.slow, repeat: Infinity, repeatType: 'reverse' },
    },
    initial: {
      scale: 1,
      transition: { duration: duration.fast },
    },
  };

  return (
    <motion.div
      className="searchable-list__overlay"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate={isOver ? 'over' : 'initial'}
      >
        <Node label="" color={nodeColor} />
      </motion.div>
      <p>Drop here to remove from network</p>
    </motion.div>
  );
};

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
  dragComponent,
  items,
  itemType,
  onDrop,
  searchOptions,
  sortOptions,
  dropNodeColor,
}) => {
  const id = useRef(uuid());
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
      return sortedResults.filter((item) => !excludeItems.includes(item.id));
    },
    [sortedResults, excludeItems],
  );

  const { isOver, willAccept } = useDropMonitor(`hyper-list-${id}`)
    || { isOver: false, willAccept: false };

  const handleChangeSearch = (eventOrValue) => {
    const value = get(eventOrValue, ['target', 'value'], eventOrValue);
    setQuery(value);
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

  const animationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const variants = {
    visible: { opacity: 1, transition: { duration: animationDuration } },
    hidden: { opacity: 0 },
  };

  const listClasses = cx(
    'searchable-list__list',
    { 'searchable-list__list--can-sort': canSort },
    { 'searchable-list__list--too-many': showTooMany },
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
            id={`hyper-list-${id}`}
            items={filteredResults}
            dynamicProperties={dynamicProperties}
            itemComponent={itemComponent}
            dragComponent={dragComponent}
            columns={columns}
            emptyComponent={EmptyComponent}
            placeholder={placeholder}
            itemType={itemType} // drop type
            accepts={accepts}
            onDrop={onDrop}
          />
          { showTooMany && (
            <div
              className={`searchable-list__too-many ${willAccept && 'searchable-list__too-many--no-text'}`}
            >
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
            }}
          />
        </div>
        <AnimatePresence>
          { willAccept && (
            <DropOverlay isOver={isOver} nodeColor={dropNodeColor} />
          )}
        </AnimatePresence>
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
  dragComponent: null,
  dropNodeColor: null,
};

export default SearchableList;
