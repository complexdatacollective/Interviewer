import { compact } from 'lodash';
import { useMemo } from 'react';

import { mapNCType } from '../../../utils/createSorter';
import { get } from '../../../utils/lodash-replacements';
import { convertNamesToUUIDs } from './helpers';

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useSortableProperties = (
  variableDefinitions,
  sortOptions,
  path = ['data', 'attributes'],
) => {
  const sortableProperties = get(sortOptions, 'sortableProperties');
  const initialSortOrder = get(sortOptions, ['sortOrder', 0]);
  const initialSortProperty = get(initialSortOrder, 'property');
  const hasSortOptions = !!sortOptions;

  const enhancedInitialSortOrder = useMemo(() => {
    if (!hasSortOptions) {
      return undefined;
    }
    const property = convertNamesToUUIDs(
      variableDefinitions,
      initialSortProperty,
    );
    const type = get(variableDefinitions, [property, 'type']);
    return {
      ...initialSortOrder,
      property: compact([...path, property]),
      type: mapNCType(type),
    };
  }, [
    hasSortOptions,
    initialSortOrder,
    initialSortProperty,
    path,
    variableDefinitions,
  ]);

  const enhancedSortableProperties = useMemo(() => {
    if (!hasSortOptions || !sortableProperties) {
      return [];
    }
    return sortableProperties.map(({ variable, label }) => {
      const uuid = convertNamesToUUIDs(variableDefinitions, variable);
      const type = get(variableDefinitions, [uuid, 'type']);
      return {
        property: compact([...path, uuid]),
        label,
        type: mapNCType(type),
      };
    });
  }, [hasSortOptions, sortableProperties, path, variableDefinitions]);

  return {
    sortableProperties: enhancedSortableProperties,
    initialSortOrder: enhancedInitialSortOrder,
  };
};

export default useSortableProperties;
