import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { get, compact } from 'lodash';
import { getProtocolCodebook } from '../../selectors/protocol';

export const getVariableMap = (state) => {
  const codebook = getProtocolCodebook(state);

  return Object
    .keys(codebook.node)
    .flatMap(
      (type) => Object
        .keys(codebook.node[type].variables)
        .map(
          (id) => [id, codebook.node[type].variables[id].name],
        ),
    );
};

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
const useSortableProperties = (sortOptions, path) => {
  const variableMap = useSelector(getVariableMap);
  const sortableProperties = get(sortOptions, 'sortableProperties');
  const initialSortOrder = get(sortOptions, ['sortOrder', 0]);

  if (!sortOptions) {
    return [[], undefined];
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

  return [enhancedSortableProperties, enhancedInitialSortOrder];
};

export default useSortableProperties;
