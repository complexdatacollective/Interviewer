import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { get, compact } from 'lodash';
import { getVariableMap } from './helpers';

const withVariableId = (variableMap, path) => (item) => {
  const ref = variableMap.find(([, name]) => name === item.variable);
  const variable = ref ? ref[0] : item.variable;

  return {
    ...item,
    variable: compact([path, variable]),
  };
};

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useSortableProperties = (sortOptions, path = 'data') => {
  const variableMap = useSelector(getVariableMap);
  const sortableProperties = get(sortOptions, 'sortableProperties');
  const initialSortOrder = get(sortOptions, ['sortOrder', 0]);

  if (!sortOptions) {
    return { sortableProperties: [], initialSortOrder: undefined };
  }

  const enhancedInitialSortOrder = useMemo(
    () => {
      const ref = variableMap.find(([, name]) => name === initialSortOrder.property);
      const property = ref ? ref[0] : initialSortOrder.property;
      return {
        ...initialSortOrder,
        property: compact([path, property]),
      };
    },
    [initialSortOrder],
  );

  const enhancedSortableProperties = useMemo(
    () => {
      if (!sortableProperties) { return []; }
      return sortableProperties.map(withVariableId(variableMap, path));
    },
    [sortableProperties],
  );

  return {
    sortableProperties: enhancedSortableProperties,
    initialSortOrder: enhancedInitialSortOrder,
  };
};

export default useSortableProperties;
