import React, { useState } from 'react';
import { hash as objectHash } from 'ohash';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Spinner } from '@codaco/ui';
import { Search } from '@codaco/ui/lib/components/Fields';
import { entityAttributesProperty } from '@codaco/shared-consts';
import createSorter from '../utils/createSorter';
import { get } from '../utils/lodash-replacements';

export const getFilteredList = (items, filterTerm, searchPropertyPath) => {
  if (!filterTerm) { return items; }

  const normalizedFilterTerm = filterTerm.toLowerCase();

  return items.filter(
    (item) => {
      const itemAttributes = searchPropertyPath ? Object.values(get(item, searchPropertyPath, {}))
        : Object.values(item);
      // Include in filtered list if any of the attribute property values
      // include the filter value
      return itemAttributes.some(
        (property) => property && property.toString().toLowerCase().includes(normalizedFilterTerm),
      );
    },
  );
};

const containerVariants = {
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      when: 'beforeChildren',
    },
  },
  hide: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
    },
  },
};

const itemVariants = {
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
    },
  },
  hide: {
    opacity: 0,
    y: 50,
    transition: {
      type: 'spring',
    },
  },
};

const NewFilterableListWrapper = (props) => {
  const {
    items,
    searchPropertyPath,
    ItemComponent,
    sortableProperties,
    loading,
    onFilterChange,
  } = props;

  // Look for the property `default: true` on a sort rule, or use the first
  const defaultSortRule = () => {
    const defaultSort = sortableProperties.findIndex(
      (property) => property.default,
    );

    return defaultSort > -1 ? defaultSort : 0;
  };

  const [filterTerm, setFilterTerm] = useState(null);
  const [sortRule, setSortRule] = useState(defaultSortRule());
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSetSortProperty = (index) => {
    if (sortRule === index) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortRule(index);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (event) => {
    const value = get(event, 'target.value', null);
    setFilterTerm(value);
    if (onFilterChange) { onFilterChange(value); }
  };

  const filteredItems = onFilterChange
    ? items : getFilteredList(items, filterTerm, searchPropertyPath);

  const sortedItems = createSorter([{
    property: sortableProperties[sortRule].variable,
    type: sortableProperties[sortRule].type,
    direction: sortDirection,
  }])(filteredItems);

  return (
    <div className="new-filterable-list">
      <header className="new-filterable-list__header">
        <section className="new-filterable-list__header-section new-filterable-list__header-section--sort">
          {(sortableProperties && sortableProperties.length > 0)
            && (
              <div className="scroll-container">
                {sortableProperties.map((sortField, index) => (
                  <div
                    tabIndex="0"
                    role="button"
                    className={`filter-button ${sortRule === index ? 'filter-button--active' : ''}`}
                    key={sortField.variable}
                    onClick={() => handleSetSortProperty(index)}
                  >
                    {
                      (sortField.label)
                    }
                    {
                      sortRule === index && (sortDirection === 'asc' ? ' \u25B2' : ' \u25BC')
                    }
                  </div>
                ))}
              </div>
            )}
        </section>
        <section className="new-filterable-list__header-section new-filterable-list__header-section--filter">
          <Search
            type="search"
            placeholder="Filter..."
            className="new-filterable-list__filter"
            input={{
              value: filterTerm || '',
              onChange: handleFilterChange,
            }}
          />
        </section>
      </header>
      <motion.main
        layout
        variants={containerVariants}
        initial="hide"
        animate="show"
        className="new-filterable-list__main"
      >
        {
          loading ? (
            <motion.div
              className="loading-state"
              layout
              key="loader"
            >
              <Spinner small />
              <h4>Loading...</h4>
            </motion.div>
          ) : (
            <AnimatePresence>
              {
                sortedItems.length > 0 && sortedItems.map((item) => (
                  <motion.div
                    variants={itemVariants}
                    key={item.key || objectHash(item)}
                    exit="hide"
                    layout
                  >
                    <ItemComponent {...item} />
                  </motion.div>
                ))
              }
            </AnimatePresence>
          )
        }
      </motion.main>
    </div>
  );
};

NewFilterableListWrapper.propTypes = {
  ItemComponent: PropTypes.elementType.isRequired,
  items: PropTypes.array.isRequired,
  searchPropertyPath: PropTypes.string,
  initialSortProperty: PropTypes.string.isRequired,
  initialSortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortableProperties: PropTypes.array,
  loading: PropTypes.bool,
  resetFilter: PropTypes.array,
  onFilterChange: PropTypes.func,
};

NewFilterableListWrapper.defaultProps = {
  initialSortDirection: 'asc',
  searchPropertyPath: entityAttributesProperty,
  sortableProperties: [],
  loading: false,
  resetFilter: [],
  onFilterChange: null,
};

export default NewFilterableListWrapper;
