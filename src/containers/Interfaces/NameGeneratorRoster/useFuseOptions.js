import { compact, isEmpty } from 'lodash';
import { useMemo } from 'react';

import { get } from '../../../utils/lodash-replacements';

const defaultFuseOptions = {
  keys: [['props', 'label']],
  threshold: 0,
};

/**
 * Convert protocol config options into a format
 * usable by SearchableList.
 */
const useFuseOptions = (
  searchOptions,
  fallbackFuseOptions = defaultFuseOptions,
  path = ['data', 'attributes'],
) => {
  const matchProperties = get(searchOptions, 'matchProperties');
  const fuzziness = get(searchOptions, 'fuzziness');
  const hasSearchOptions = searchOptions && !isEmpty(searchOptions);

  const keys = useMemo(
    () =>
      hasSearchOptions
        ? matchProperties.map((property) => compact([...path, property]))
        : [],
    [hasSearchOptions, matchProperties, path],
  );

  if (!hasSearchOptions) {
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
