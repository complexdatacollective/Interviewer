import { useMemo } from 'react';
import { compact } from 'lodash';
import { convertNamesToUUIDs } from './helpers';
import { get } from '../../../utils/lodash-replacements';
import { mapNCType } from '../../../utils/createSorter';

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
      const type = get(variableDefinitions, [property, 'type']);
      return {
        ...initialSortOrder,
        property: compact([...path, property]),
        type: mapNCType(type),
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
          const type = get(variableDefinitions, [uuid, 'type']);
          return {
            property: compact([...path, uuid]),
            label,
            type: mapNCType(type),
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
