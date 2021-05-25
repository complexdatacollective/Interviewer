import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  debounce,
  delay,
} from 'lodash';
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
  const [IsWaiting, setIsWaiting] = useState(false);

  const search = useCallback(
    debounce((_query) => {
      const startTime = new Date();
      const r = fuse.search(_query);

      const endTime = new Date();
      const minDelay = 500 - (endTime - startTime);

      if (minDelay > 0) {
        delay(() => {
          setResults(r);
          setIsWaiting(false);
        }, minDelay);
      }

      setResults(r);
      setIsWaiting(false);
    }, 500),
    [setIsWaiting, setResults, fuse],
  );

  useEffect(() => {
    if (query.length <= 1) {
      setResults(list);
      return;
    }

    if (list.length > 100) {
      setIsWaiting(true);
    }

    search(query);
  }, [fuse, query, search]);

  return [results, query, setQuery, IsWaiting];
};

export default useSearch;
