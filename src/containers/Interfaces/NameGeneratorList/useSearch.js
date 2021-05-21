import { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';

const defaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true, // Break up query so it can match across different fields
  keys: ['props.label'], // TODO: Update this
};

const getFuseOptions = (options) => {
  const threshold = typeof options.fuzziness !== 'number'
    ? defaultFuseOpts.threshold
    : options.fuzziness;

  return {
    ...defaultFuseOpts,
    // keys: options.matchProperties, // TODO: Update this
    threshold,
  };
};

/**
 * useSearch
 *
 * Returns a filtered version of a list based on query term.
 *
 * Main required option is `keys`
 */
const useSearch = (list, options, initialQuery = '') => {
  const fuse = useMemo(
    () => new Fuse(list, getFuseOptions(options)),
    [list, options],
  );

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(list);

  useEffect(() => {
    if (query.length <= 1) {
      setResults(list);
      return;
    }

    setResults(fuse.search(query));
  }, [fuse, query]);

  return [results, query, setQuery];
};

export default useSearch;
