import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import Fuse from 'fuse.js';
import useDebounce from '../../hooks/useDebounce';

// TODO:
// const searchOptions = { matchProperties: [], ...stage.searchOptions };

// // Map the matchproperties to add the entity attributes object, and replace names with
// // uuids, where possible.
// searchOptions.matchProperties = searchOptions.matchProperties.map((prop) => {
//   const nodeTypeVariables = nodeTypeDefinition.variables;
//   const replacedProp = getParentKeyByNameValue(nodeTypeVariables, prop);
//   return (`${entityAttributesProperty}.${replacedProp}`);
// });

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY = 1000;
const DEBOUNCE_DELAY = 500;

const defaultFuseOpts = {
  threshold: 0,
  minMatchCharLength: 2,
  shouldSort: false,
  tokenize: true, // Break up query so it can match across different fields
  keys: [],
};

const getFuseOptions = (options) => {
  const threshold = typeof options.fuzziness !== 'number'
    ? defaultFuseOpts.threshold
    : options.fuzziness;

  const keys = !options.matchProperties
    ? defaultFuseOpts.keys
    : options.matchProperties.map((variable) => ['data', variable]);

  return {
    ...defaultFuseOpts,
    threshold,
    keys,
  };
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
 * Main required option is `keys`
 */
const useSearch = (list, options, initialQuery = '') => {
  const delayRef = useRef();

  const [query, setQuery, displayQuery] = useQuery(initialQuery);
  const [results, setResults] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

  const hasQuery = query.length > MIN_QUERY_LENGTH;

  const search = (_query) => {
    clearTimeout(delayRef.current);
    const startTime = new Date();
    const fuse = new Fuse(list, getFuseOptions(options));
    const r = fuse.search(_query);

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
      setResults(null);
    }

    search(query);
  }, [query]);

  const returnResults = useMemo(() => (
    hasQuery ? results : list
  ), [hasQuery, list, results]);

  return [returnResults, displayQuery, setQuery, isWaiting, hasQuery];
};

export default useSearch;
