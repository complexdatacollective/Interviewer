import React, { useState, useEffect } from 'react';
import { get } from 'lodash';
import objectHash from 'object-hash';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Button, Spinner } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { entityAttributesProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';

const NewFilterableListWrapper = (props) => {
  const {
    items,
    propertyPath,
    ItemComponent,
    initialSortProperty,
    initialSortDirection,
    sortableProperties,
    loading,
    onFilterChange,
    resetFilter,
  } = props;

  const [filterTerm, setFilterTerm] = useState(null);
  const [sortProperty, setSortProperty] = useState(initialSortProperty);
  const [sortAscending, setSortAscending] = useState(initialSortDirection === 'asc');

  useEffect(() => {
    if (resetFilter.every((v) => v === false)) { return; }
    setFilterTerm(null);
  }, resetFilter);

  const handleSetSortProperty = (property) => {
    if (sortProperty === property) {
      setSortAscending(!sortAscending);
    } else {
      setSortAscending(true);
      setSortProperty(property);
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value || null;
    setFilterTerm(value);
    onFilterChange(value);
  };

  const sortedItems = sortOrder([{
    property: sortProperty,
    direction: sortAscending ? 'asc' : 'desc',
  }], {}, propertyPath)(items);

  const getFilteredAndSortedItemList = () => {
    if (!filterTerm) { return sortedItems; }

    const normalizedFilterTerm = filterTerm.toLowerCase();
    const hasFilterTerm = (property) => property.toLowerCase().includes(normalizedFilterTerm);

    return sortedItems.filter(
      (item) => {
        const itemAttributes = propertyPath ? Object.values(get(item, propertyPath, {}))
          : Object.values(item);
        // Include in filtered list if any of the attribute property values
        // include the filter value
        return itemAttributes.some((property) => property && hasFilterTerm(property.toString()));
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
      y: 25,
      transition: {
        type: 'spring',
      },
    },
  };

  const sortedAndFilteredList = getFilteredAndSortedItemList();

  return (
    <div
      className="new-filterable-list"
    >
      <header className="new-filterable-list__header">
        <section className="new-filterable-list__header-section new-filterable-list__header-section--sort">
          { (sortableProperties && sortableProperties.length > 0)
            && (
            <div className="scroll-container">
              <h4>Sort: </h4>
              {sortableProperties.map((sortField) => (
                <Button
                  color={sortProperty === sortField.variable ? 'primary' : 'white'}
                  key={sortField.variable}
                  onClick={() => handleSetSortProperty(sortField.variable)}
                >
                  {
                    (sortField.label)
                  }
                  {
                    sortProperty === sortField.variable && (sortAscending ? ' \u25B2' : ' \u25BC')
                  }
                </Button>
              ))}
            </div>
            )}
        </section>
        <section className="new-filterable-list__header-section new-filterable-list__header-section--filter">
          <h4>Filter: </h4>
          <Text
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
                sortedAndFilteredList.length > 0 && sortedAndFilteredList.map((item) => (
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
  propertyPath: PropTypes.string,
  initialSortProperty: PropTypes.string.isRequired,
  initialSortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortableProperties: PropTypes.array,
  loading: PropTypes.bool,
  resetFilter: PropTypes.array,
  onFilterChange: PropTypes.func,
};

NewFilterableListWrapper.defaultProps = {
  initialSortDirection: 'asc',
  propertyPath: entityAttributesProperty,
  sortableProperties: [],
  loading: false,
  resetFilter: [],
  onFilterChange: () => {},
};

export default NewFilterableListWrapper;
