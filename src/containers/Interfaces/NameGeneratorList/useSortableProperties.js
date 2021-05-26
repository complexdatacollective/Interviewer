import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getVariableMap } from './helpers';

// Sortable properties with ids
const useSortableProperties = (stage) => {
  const variableMap = useSelector(getVariableMap);
  const sortableProperties = stage.sortOptions && stage.sortOptions.sortableProperties;
  const enhancedSortableProperties = useMemo(
    () => {
      if (!sortableProperties) { return []; }
      return sortableProperties.map((item) => {
        const ref = variableMap.find(([, name]) => name === item.variable);
        const variable = ref ? ref[0] : item.variable;
        return {
          ...item,
          variable,
        };
      });
    },
    [sortableProperties],
  );

  return enhancedSortableProperties;
};

export default useSortableProperties;
