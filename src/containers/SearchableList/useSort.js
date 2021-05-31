import { useMemo, useState } from 'react';
import { sortBy, get } from 'lodash/fp';

const defaultSortOrder = {
  direction: 'asc',
  property: null,
};

const sorter = (property) => (item) => get(item, ['data', property]);

/**
 * useSort
 *
 * Expects `list` to be in format:
 * `[{ data, ... }, ...]`
 *
 * Any properties on `data` can be specified as the `sortByProperty`.
 */
const useSort = (list, initialSortOrder = defaultSortOrder) => {
  const { property: initialSortBy, direction: initialDirection } = initialSortOrder;
  const [sortByProperty, setSortByProperty] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const toggleSortDirection = () => setSortDirection(
    (d) => (d === 'desc' ? 'asc' : 'desc'),
  );

  const updateSortByProperty = (property) => {
    if (property === sortByProperty) {
      toggleSortDirection();
      return;
    }

    setSortByProperty(property);
    setSortDirection(defaultSortOrder.direction);
  };

  const sortedList = useMemo(() => {
    if (!sortByProperty) { return list; }
    return sortDirection === 'desc'
      ? sortBy([sorter(sortByProperty)])(list).reverse()
      : sortBy([sorter(sortByProperty)])(list);
  }, [list, sortByProperty, sortDirection]);

  return [sortedList, sortByProperty, sortDirection, updateSortByProperty, toggleSortDirection];
};
export default useSort;
