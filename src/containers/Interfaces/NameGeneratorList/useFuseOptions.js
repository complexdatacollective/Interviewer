import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { get, compact } from 'lodash';
import { getVariableMap } from './helpers';

const defaultFuseOptions = {
  keys: [['props', 'label']],
  threshold: 0,
};

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useFuseOptions = (searchOptions, path = 'data', fallbackFuseOptions = defaultFuseOptions) => {
  const variableMap = useSelector(getVariableMap);
  const matchProperties = get(searchOptions, 'matchProperties');
  const fuzziness = get(searchOptions, 'fuzziness');

  if (!searchOptions) {
    return fallbackFuseOptions;
  }

  const keys = useMemo(
    () => matchProperties.map((property) => {
      const ref = variableMap.find(([, name]) => name === property);
      const nameOrVariable = ref ? ref[0] : property;
      return compact([path, nameOrVariable]);
    }),
    [matchProperties],
  );

  const fuseOptions = {
    ...(typeof fuzziness === 'number' && {
      threshold: fuzziness,
    }),
    keys,
  };

  return fuseOptions;
};

export default useFuseOptions;
