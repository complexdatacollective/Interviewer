import { useMemo } from 'react';
import { compact, isEmpty } from 'lodash';
import { get } from '../../../utils/lodash-replacements';

const defaultFuseOptions = {
  keys: [['props', 'label']],
  threshold: 0,
};

/**
 * Convert protocol config options into a format
 * usable by SearchableList.
 */
const useFuseOptions = (searchOptions, fallbackFuseOptions = defaultFuseOptions, path = ['data', 'attributes']) => {
  const matchProperties = get(searchOptions, 'matchProperties');
  const fuzziness = get(searchOptions, 'fuzziness');

  if (!searchOptions || isEmpty(searchOptions)) {
    return fallbackFuseOptions;
  }

  const keys = useMemo(
    () => matchProperties.map((property) => compact([...path, property])),
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
