import { useMemo, useState } from 'react';
import { isEqual } from 'lodash';
import createSorter from '../utils/createSorter';

const defaultSortOrder = {
  direction: 'asc',
  property: ['data', 'attributes', 'name'],
  type: 'string',
};

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
  const {
    property: initialProperty,
    direction: initialDirection,
    type: initialType,
  } = initialSortOrder;

  const [sortByProperty, setSortByProperty] = useState(initialProperty);
  const [sortType, setSortType] = useState(initialType);
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

    const rule = {
      property: sortByProperty,
      direction: sortDirection,
      type: sortType,
    };

    const sorter = createSorter([rule]);

    return sorter(list);
  }, [list, sortByProperty, sortDirection, sortType]);

  return [
    sortedList,
    sortByProperty,
    sortDirection,
    updateSortByProperty,
    setSortType,
    setSortDirection,
  ];
};

export default useSort;
