import React, { useState } from 'react';
import { get } from 'lodash';
import objectHash from 'object-hash';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
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
  } = props;

  const [filterTerm, setFilterTerm] = useState(null);
  const [sortProperty, setSortProperty] = useState(initialSortProperty);
  const [sortAscending, setSortAscending] = useState(initialSortDirection === 'asc');

  const handleSetSortProperty = (property) => {
    if (sortProperty === property) {
      setSortAscending(!sortAscending);
    } else {
      setSortAscending(true);
      setSortProperty(property);
    }
  };

  const onFilterChange = event => setFilterTerm(event.target.value || null);

  const sortedItems = sortOrder([{
    property: sortProperty,
    direction: sortAscending ? 'asc' : 'desc',
  }], {}, propertyPath)(items);

  const getFilteredAndSortedItemList = () => {
    if (!filterTerm) { return sortedItems; }

    const normalizedFilterTerm = filterTerm.toLowerCase();

    return sortedItems.filter(
      (item) => {
        const itemAttributes =
          propertyPath ? Object.values(get(item, propertyPath, {}))
            : Object.values(item);
        // Include in filtered list if any of the attribute property values
        // include the filter value
        return itemAttributes.some(
          property => property.toString().toLowerCase().includes(normalizedFilterTerm),
        );
      },
    );
  };

  const containerVariants = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
      },
    },
  };

  const itemVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
      },
    },
    hidden: {
      opacity: 0,
      y: 25,
      transition: {
        type: 'spring',
      },
    },
  };

  return (
    <div
      className="new-filterable-list"
    >
      <header className="new-filterable-list__header">
        <section className="new-filterable-list__header-section new-filterable-list__header-section--sort">
          { (sortableProperties && sortableProperties.length > 0) &&
            <div className="scroll-container">
              <h4>Sort: </h4>
              {sortableProperties.map(sortField => (
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
          }
        </section>
        <section className="new-filterable-list__header-section new-filterable-list__header-section--filter">
          <h4>Filter: </h4>
          <Text
            type="search"
            placeholder="Filter..."
            className="new-filterable-list__filter"
            input={{
              onChange: onFilterChange,
            }}
          />
        </section>
      </header>
      <main className="new-filterable-list__main">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="test"
        >
          <AnimateSharedLayout>
            <AnimatePresence>
              {
                getFilteredAndSortedItemList().map(item => (
                  <motion.div
                    variants={itemVariants}
                    key={objectHash(item)}
                    layout
                  >
                    <ItemComponent {...item} />
                  </motion.div>
                ))
              }
            </AnimatePresence>
          </AnimateSharedLayout>

        </motion.div>
      </main>
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
};

NewFilterableListWrapper.defaultProps = {
  initialSortDirection: 'asc',
  propertyPath: entityAttributesProperty,
  sortableProperties: [],
};

export default NewFilterableListWrapper;
