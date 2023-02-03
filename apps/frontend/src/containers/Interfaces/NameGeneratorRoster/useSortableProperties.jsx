import { useMemo } from 'react';
import { compact } from 'lodash';
import { convertNamesToUUIDs } from './helpers';
import { get } from '../../../utils/lodash-replacements';

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useSortableProperties = (variableDefinitions, sortOptions, path = ['data', 'attributes']) => {
  const sortableProperties = get(sortOptions, 'sortableProperties');
  const initialSortOrder = get(sortOptions, ['sortOrder', 0]);
  const initialSortProperty = get(initialSortOrder, 'property');

  const enhancedInitialSortOrder = useMemo(
    () => {
      const property = convertNamesToUUIDs(variableDefinitions, initialSortProperty);
      return {
        ...initialSortOrder,
        property: compact([...path, property]),
      };
    },
    [initialSortOrder, initialSortProperty, path, variableDefinitions],
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
    [sortableProperties, path, variableDefinitions],
  );

  if (!sortOptions) {
    return { sortableProperties: [], initialSortOrder: undefined };
  }

  return {
    sortableProperties: enhancedSortableProperties,
    initialSortOrder: enhancedInitialSortOrder,
  };
};

export default useSortableProperties;
