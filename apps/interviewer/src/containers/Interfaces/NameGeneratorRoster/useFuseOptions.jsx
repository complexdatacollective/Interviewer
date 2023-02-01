import { useMemo } from 'react';
import { compact, isEmpty } from 'lodash';
import { get } from '../../../utils/lodash-replacements';

const defaultFuseOptions = {
  keys: [['props', 'label']],
  threshold: 0,
};

/**
 * Convert protocol config options into a format
 * usable by useSort. Essentially specific to SearchableList.
 */
const useFuseOptions = (searchOptions, fallbackFuseOptions = defaultFuseOptions, path = ['data', 'attributes']) => {
  const matchProperties = get(searchOptions, 'matchProperties');
  const fuzziness = get(searchOptions, 'fuzziness');

  const keys = useMemo(
    () => matchProperties.map((property) => compact([...path, property])),
    [matchProperties, path],
  );

  if (!searchOptions || isEmpty(searchOptions)) {
    return fallbackFuseOptions;
  }

  const fuseOptions = {
    ...(typeof fuzziness === 'number' && {
      threshold: fuzziness,
    }),
    keys,
  };

  return fuseOptions;
};

export default useFuseOptions;
