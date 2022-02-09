import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Fuse from 'fuse.js';

const MIN_QUERY_LENGTH = 1;
const DEBOUNCE_DELAY = 500;

const defaultFuseOptions = {
  minMatchCharLength: 1,
  shouldSort: false,
  includeScore: true,
  ignoreLocation: true, // Search whole strings
  findAllMatches: true,
  useExtendedSearch: true,
};

// Variation of useState which includes a debounced value
/**
 * TODO: This is not what was intended.
 *
 * The initial implementation debounced the query, but this just created
 * an artificial delay to show a loading screen. What we wanted was to
 * show a loading screen _if necessary_ while search results came back.
 *
 * The correct way to implement this is going to be to move fuse to a
 * webworker, and develop a messaging system for data and results.
 *
 * This could be done as part of pre-processing assets at the start of
 * the interview. A worker could be created for each network asset,
 * which optionally exposes search and sort methods
 */
// const useQuery = (initialQuery, delay = DEBOUNCE_DELAY) => {
//   const [query, setQuery] = useState(initialQuery);
//   const debouncedQuery = useDebounce(query, delay);

//   return [debouncedQuery, setQuery, query];
// };

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
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(list);
  const [isWaiting, setIsWaiting] = useState(false);

  const hasQuery = useMemo(() => query.length >= MIN_QUERY_LENGTH, [query]);
  const isLargeList = useMemo(() => list.length > 100, [list]);

  const fuseOptions = { ...defaultFuseOptions, ...options };
  const fuse = useMemo(() => new Fuse(list, fuseOptions), [list, fuseOptions]);

  const search = useCallback((_query) => {
    if (isLargeList) {
      clearTimeout(delayRef.current);
      setIsWaiting(true);
    }

    const res = fuse.search(_query);

    const r = res.map(({ item, score }) => ({
      ...item,
      relevance: 1 - score, // fuseJS relevance is reverse nomalized (0 is perfect match)
    }));

    if (isLargeList) {
      delayRef.current = setTimeout(() => {
        setResults(r);
        setIsWaiting(false);
      }, DEBOUNCE_DELAY);
      return;
    }

    setResults(r);
    setIsWaiting(false);
  }, [fuse, isLargeList]);

  useEffect(() => {
    if (!hasQuery) {
      return;
    }

    search(query);
  }, [query]);

  const returnResults = useMemo(() => (
    hasQuery ? results : list
  ), [hasQuery, list, results]);

  return [returnResults, query, setQuery, isWaiting, hasQuery];
};

export default useSearch;
