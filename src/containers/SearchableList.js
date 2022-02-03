import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { isEqual, get } from 'lodash';
import { Node } from '@codaco/ui';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import Search from '@codaco/ui/lib/components/Fields/Search';
import Loading from '../components/Loading';
import Panel from '../components/Panel';
import useSort from '../hooks/useSort';
import useSearch from '../hooks/useSearch';
import HyperList from './HyperList';
import useAnimationSettings from '../hooks/useAnimationSettings';
import useDropMonitor from '../behaviours/DragAndDrop/useDropMonitor';

const LargeRosterNotice = () => (
  <div className="large-roster-notice">
    <h2>Too many items.</h2>
    <p>Use the search feature to see results here.</p>
  </div>
);

const SortButton = ({
  setSortByProperty,
  variable,
  color,
  label,
  isActive,
  sortDirection,
}) => (
  <div
    tabIndex={0}
    role="button"
    className={`filter-button ${isActive ? 'filter-button--active' : ''}`}
    onClick={() => setSortByProperty(variable)}
    key={variable}
    color={color}
  >
    {label}

    {isActive && (
      sortDirection === 'asc' ? ' \u25B2' : ' \u25BC'
    )}
  </div>
);

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
const SearchableList = (props) => {
  const {
    accepts,
    columns,
    title,
    dynamicProperties,
    excludeItems,
    itemComponent,
    dragComponent,
    items,
    placeholder,
    itemType,
    onDrop,
    searchOptions,
    sortOptions,
    dropNodeColor,
  } = props;

  const id = useRef(uuid());
  const [results, query, setQuery, isWaiting, hasQuery] = useSearch(items, searchOptions);

  const [
    sortedResults,
    sortByProperty,
    sortDirection,
    setSortByProperty,
  ] = useSort(results, sortOptions.initialSortOrder);

  useEffect(() => {
    if (hasQuery) {
      setSortByProperty(['relevance']);
      return;
    }

    setSortByProperty([sortOptions.initialSortProperty]);
  }, [hasQuery]);

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

  const hyperListPlaceholder = placeholder || (
    isWaiting
      ? (
        <div className="searchable-list__placeholder">
          <Loading message="searching..." />
        </div>
      )
      : null
  );

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
        title={title}
        noHighlight
        noCollapse
      >
        <div className={listClasses}>
          { showTooMany && !willAccept ? (
            <LargeRosterNotice />
          ) : (
            <HyperList
              id={`hyper-list-${id}`}
              items={filteredResults}
              dynamicProperties={dynamicProperties}
              itemComponent={itemComponent}
              dragComponent={dragComponent}
              columns={columns}
              emptyComponent={EmptyComponent}
              placeholder={hyperListPlaceholder}
              itemType={itemType} // drop type
              accepts={accepts}
              onDrop={onDrop}
            />
          )}
        </div>
        { canSort && (
          <div className="searchable-list__sort">
            {
              hasQuery && (
                <div
                  className={`filter-button ${isEqual(sortByProperty, ['relevance']) ? 'filter-button--active' : ''}`}
                  onClick={() => {
                    setSortByProperty(['relevance']);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  Relevance
                  {isEqual(sortByProperty, ['relevance']) && (
                    sortDirection === 'asc' ? ' \u25B2' : ' \u25BC'
                  )}
                </div>
              )
            }
            {sortOptions.sortableProperties.map(({ variable, label }) => {
              const isActive = isEqual(variable, sortByProperty);
              const color = isActive ? 'primary' : 'platinum';
              return (
                <SortButton
                  variable={variable}
                  setSortByProperty={setSortByProperty}
                  color={color}
                  label={label}
                  isActive={isActive}
                  sortDirection={sortDirection}
                />
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
  columns: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.func,
  ]),
  itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  dragComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  items: PropTypes.array,
  placeholder: PropTypes.node,
  searchOptions: PropTypes.object,
  sortableProperties: PropTypes.array,
  dynamicProperties: PropTypes.object,
  excludeItems: PropTypes.array,
  dropNodeColor: PropTypes.string,
};

SearchableList.defaultProps = {
  columns: undefined,
  itemComponent: null,
  items: [],
  placeholder: null,
  searchOptions: {},
  sortableProperties: [],
  dynamicProperties: {},
  excludeItems: [],
  dragComponent: null,
  dropNodeColor: null,
};

export default SearchableList;
