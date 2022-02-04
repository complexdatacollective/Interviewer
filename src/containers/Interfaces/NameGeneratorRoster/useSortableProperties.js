import { useMemo } from 'react';
import { get, compact } from 'lodash';
import { convertNamesToUUIDs } from './helpers';

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useSortableProperties = (variableDefinitions, sortOptions, path = ['data', 'attributes']) => {
  const sortableProperties = get(sortOptions, 'sortableProperties');
  const initialSortOrder = get(sortOptions, ['sortOrder', 0]);
  const initialSortProperty = get(initialSortOrder, 'property');

  if (!sortOptions) {
    return { sortableProperties: [], initialSortOrder: undefined };
  }

  const enhancedInitialSortOrder = useMemo(
    () => {
      const property = convertNamesToUUIDs(variableDefinitions, initialSortProperty);
      return {
        ...initialSortOrder,
        property: compact([...path, property]),
      };
    },
    [initialSortOrder],
  );

  const enhancedSortableProperties = useMemo(
    () => {
      if (!sortableProperties) { return []; }
      return sortableProperties
        .map(({ variable, label }) => {
          const uuid = convertNamesToUUIDs(variableDefinitions, variable);
          return {
            variable: compact([...path, uuid]),
            label,
          };
        });
    },
    [sortableProperties],
  );

  return {
    sortableProperties: enhancedSortableProperties,
    initialSortOrder: enhancedInitialSortOrder,
  };
};

export default useSortableProperties;
