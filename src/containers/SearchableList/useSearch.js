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

const minQueryLength = 2;
const minDelay = 2000;

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

const useQuery = (initialQuery) => {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

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

  const hasQuery = query.length > minQueryLength;

  const search = (_query) => {
    clearTimeout(delayRef.current);
    const startTime = new Date();
    const fuse = new Fuse(list, getFuseOptions(options));
    const r = fuse.search(_query);

    const endTime = new Date();
    const delay = minDelay - (endTime - startTime);

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
