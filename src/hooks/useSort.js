import { useMemo, useState } from 'react';
import { sortBy, get } from 'lodash/fp';
import { isEqual } from 'lodash';

const defaultSortOrder = {
  direction: 'asc',
  property: null,
};

const getProperty = (property) => get(property);

/**
 * Sort a list of items
 *
 * Expects `list` to be in format:
 * `[{ data, ... }, ...]`
 *
 * Any properties on `data` can be specified as the `sortByProperty`.
 *
 * Sort direction is either 'asc' or 'desc'.
 *
 * For initialSortOrder, direction is optional.
 *
 * Usage:
 *
 * const [
 *  sorted,
 *  sortProperty,
 *  sortDirection,
 *  setProperty,
 *  toggleDirection,
 * ] = useSort(list, { property: 'name', direction: 'asc'});
 */
const useSort = (list, initialSortOrder = defaultSortOrder) => {
  const { property: initialProperty, direction: initialDirection } = initialSortOrder;
  const [sortByProperty, setSortByProperty] = useState(initialProperty);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const toggleSortDirection = () => setSortDirection(
    (d) => (d === 'desc' ? 'asc' : 'desc'),
  );

  const updateSortByProperty = (newProperty) => {
    // If no property, reset to initial
    if (!newProperty) {
      setSortByProperty(initialProperty);
      setSortDirection(initialDirection);
      return;
    }

    // If property already selected, change direction only
    if (isEqual(newProperty, sortByProperty)) {
      toggleSortDirection();
      return;
    }

    // Otherwise, set property and default direction
    setSortByProperty(newProperty);
    setSortDirection(defaultSortOrder.direction);
  };

  const sortedList = useMemo(() => {
    if (!sortByProperty) { return list; }
    return sortDirection === 'desc'
      ? sortBy([getProperty(sortByProperty)])(list).reverse()
      : sortBy([getProperty(sortByProperty)])(list);
  }, [list, sortByProperty, sortDirection]);

  return [sortedList, sortByProperty, sortDirection, updateSortByProperty, toggleSortDirection];
};

export default useSort;
