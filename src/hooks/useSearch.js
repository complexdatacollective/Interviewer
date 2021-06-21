import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import Fuse from 'fuse.js';
import useDebounce from './useDebounce';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY = 1000;
const DEBOUNCE_DELAY = 500;

const defaultFuseOptions = {
  minMatchCharLength: 2,
  shouldSort: false,
  ignoreLocation: true, // Search whole strings
};

// Variation of useState which includes a debounced value
const useQuery = (initialQuery, delay = DEBOUNCE_DELAY) => {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, delay);

  return [debouncedQuery, setQuery, query];
};

/**
 * useSearch
 *
 * Returns a filtered version of a list based on query term.
 *
 * @param {Array} items A list of formatted items,
 * @param {Object} options `keys` is essentially a required prop, see fuse.js for more settings.
 *
 * Usage:
 *
 * const [
 *   results,
 *   query,
 *   updateQuery,
 *   isWaiting,
 *   hasQuery,
 * ] = useSearch(items, { keys: ['name'] });
 */
const useSearch = (list, options, initialQuery = '') => {
  const delayRef = useRef();

  const [query, setQuery, displayQuery] = useQuery(initialQuery);
  const [results, setResults] = useState(list);
  const [isWaiting, setIsWaiting] = useState(false);

  const hasQuery = displayQuery.length >= MIN_QUERY_LENGTH;

  const fuseOptions = { ...defaultFuseOptions, ...options };

  const search = (_query) => {
    clearTimeout(delayRef.current);
    const startTime = new Date();
    const fuse = new Fuse(list, fuseOptions);
    const r = fuse.search(_query).map(({ item }) => item);

    const endTime = new Date();
    const delay = SEARCH_DELAY - (endTime - startTime);

    if (list.length < 100) {
      setResults(r);
      setIsWaiting(false);
      return;
    }

    if (delay > 0) {
      delayRef.current = setTimeout(() => {
        setResults(r);
        setIsWaiting(false);
      }, delay);
      return;
    }

    setResults(r);
    setIsWaiting(false);
  };

  useEffect(() => {
    if (!hasQuery) {
      return;
    }

    if (list.length > 100) {
      setIsWaiting(true);
    }

    search(query);
  }, [query]);

  const returnResults = useMemo(() => (
    hasQuery ? results : list
  ), [hasQuery, list, results]);

  return [returnResults, displayQuery, setQuery, isWaiting, hasQuery];
};

export default useSearch;
