import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import Scroller from './Scroller';
import { entityAttributesProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';
import { selectable } from '../behaviours';
import {
  DragSource,
} from '../behaviours/DragAndDrop';

const NewFilterableListWrapper = (props) => {
  const {
    items,
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
  }])(items);

  const getFilteredAndSortedItemList = () => {
    if (!filterTerm) { return sortedItems; }

    const normalizedFilterTerm = filterTerm.toLowerCase();

    return sortedItems.filter(
      (item) => {
        const itemProperties = Object.values(item[entityAttributesProperty]);
        // Include in filtered list if any of the attribute property values
        // include the filter value
        return itemProperties.some(
          property => property.toString().toLowerCase().includes(normalizedFilterTerm),
        );
      },
    );
  };

  return (
    <motion.div
      className="new-filterable-list"
    >
      <header className="new-filterable-list__header">
        <section>
          { (sortableProperties && sortableProperties.length > 0) &&
            <React.Fragment>
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
                    sortProperty === sortField.variable && (sortAscending ? '\u25B2' : ' \u25BC')
                  }
                </Button>
              ))}
            </React.Fragment>
          }
        </section>
        <section>
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
        <Scroller>
          {
            getFilteredAndSortedItemList().map((item, index) => {
              const EnhancedItem = DragSource(selectable(ItemComponent));
              return (
                <EnhancedItem {...item} key={index} />
              );
            })
          }
        </Scroller>
      </main>
    </motion.div>
  );
};

NewFilterableListWrapper.propTypes = {
  ItemComponent: PropTypes.elementType.isRequired,
  items: PropTypes.array.isRequired,
  initialSortProperty: PropTypes.string.isRequired,
  initialSortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortableProperties: PropTypes.array,
};

NewFilterableListWrapper.defaultProps = {
  initialSortDirection: 'asc',
  sortableProperties: [],
};

export default NewFilterableListWrapper;
