/* eslint-disable @codaco/spellcheck/spell-checker */
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
import { compose } from 'recompose';
import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';

const LargeRosterNotice = () => (
  <motion.div
    className="large-roster-notice"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2>Too many items to display.</h2>
    <p>Use the search feature to see results here.</p>
  </motion.div>
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
  <motion.div
    className="searchable-list__placeholder"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2>Nothing matched your search term.</h2>
  </motion.div>
);

const DropOverlay = compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)((props) => {
  const {
    willAccept, isOver, nodeColor,
  } = props;

  return (
    <div
      className="searchable-list__overlay"
      style={{
        height: willAccept ? '100%' : '0',
        opacity: willAccept ? 1 : 0,
        backgroundColor: isOver && 'rgba(0, 201, 162, 0.2)',
      }}
    >
      <motion.div
        animate={{
          y: [0, 7, 0, 7, 0],
        }}
        transition={{
          duration: 2,
          loop: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Node label="" color={nodeColor} />
      </motion.div>
      <h2>Drop here to remove</h2>
    </div>
  );
});

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
    setSortDirection,
  ] = useSort(results, sortOptions.initialSortOrder);

  useEffect(() => {
    if (hasQuery) {
      setSortByProperty(['relevance']);
      setSortDirection('desc');
      return;
    }

    setSortByProperty();
  }, [hasQuery]);

  const filteredResults = useMemo(
    () => {
      if (!excludeItems || !sortedResults) { return sortedResults; }
      return sortedResults.filter((item) => !excludeItems.includes(item.id));
    },
    [sortedResults, excludeItems],
  );

  const handleChangeSearch = (eventOrValue) => {
    const value = get(eventOrValue, ['target', 'value'], eventOrValue);
    setQuery(value);
  };

  const mode = items.length > 100 ? modes.LARGE : modes.SMALL;

  const hyperListPlaceholder = placeholder || (
    isWaiting
      ? (
        <motion.div
          className="searchable-list__placeholder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loading message="Searching..." />
        </motion.div>
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
          <AnimatePresence exitBeforeEnter>
            { showTooMany ? (
              <LargeRosterNotice />
            ) : (
              <HyperList
                id={`hyper-list-${id.current}`}
                items={filteredResults}
                dynamicProperties={dynamicProperties}
                itemComponent={itemComponent}
                dragComponent={dragComponent}
                columns={columns}
                emptyComponent={EmptyComponent}
                placeholder={hyperListPlaceholder}
              />
            )}
          </AnimatePresence>
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
                  key={variable}
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
        <DropOverlay
          id="drop-overlay"
          nodeColor={dropNodeColor}
          itemType={itemType} // drop type
          accepts={accepts}
          onDrop={onDrop}
        />
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
