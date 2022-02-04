import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';

const MIN_QUERY_LENGTH = 1;
const DEBOUNCE_DELAY = 500;

const defaultFuseOptions = {
  minMatchCharLength: 2,
  shouldSort: false,
  includeScore: true,
  ignoreLocation: true, // Search whole strings
  findAllMatches: true,
  useExtendedSearch: true,
};

// JRM: removed - see note in useSearch
// Variation of useState which includes a debounced value
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
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(list);
  const [isWaiting, setIsWaiting] = useState(false);

  const hasQuery = query.length >= MIN_QUERY_LENGTH;

  const fuseOptions = { ...defaultFuseOptions, ...options };

  const search = (_query) => {
    clearTimeout(delayRef.current);
    const fuse = new Fuse(list, fuseOptions);
    const res = fuse.search(_query);

    const r = res.map(({ item, score }) => ({
      ...item,
      relevance: 1 - score, // fuseJS relevance is reverse nomalized (0 is perfect match)
    }));

    if (list.length < 100) {
      setResults(r);
      setIsWaiting(false);
      return;
    }

    setResults(r);
    setIsWaiting(false);
  };

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) { return; }
    setIsWaiting(true);
  }, [query]);

  const debouncedSearch = useCallback(
    debounce(search, DEBOUNCE_DELAY),
    [],
  );

  useEffect(() => {
    if (!hasQuery) {
      setIsWaiting(false);
      return;
    }

    debouncedSearch(query);
  }, [query]);

  const returnResults = useMemo(() => (
    hasQuery ? results : list
  ), [hasQuery, list, results]);

  return [returnResults, query, setQuery, isWaiting, hasQuery];
};

export default useSearch;
