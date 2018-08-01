import { omit, orderBy } from 'lodash';

/* Maps a `createdIndex` index value to all items in an array */
const withCreatedIndex = items => items.map((item, createdIndex) => ({ ...item, createdIndex }));

/* all items without the 'createdIndex' prop */
const withoutCreatedIndex = items => items.map(item => omit(item, 'createdIndex'));

/* property iteratee for the special case "*" property, which sorts by `createdIndex` */
const fifo = ({ createdIndex }) => createdIndex;

/**
 * Returns a configured sorting function
 * @param {Array} sortConfig - list of rules to sort by
 * @param {Object} variableRegistry - an object containing variables for the node type as specified
 * at: `variableRegistry.node[nodeType]variables`
 * TODO: Use variable registry to respect variable type?
 */
const sortOrder = (sortConfig = [], variableRegistry = {}) => { // eslint-disable-line
  // '*' is a special prop to sort by the order in which nodes were added to the network
  const isFifoLifo = rule => rule.property === '*';

  // Lodash sort is stable; we can discard any fifo (*.asc) rules as no-ops.
  const sortRules = sortConfig.filter(rule => !(isFifoLifo(rule) && rule.direction === 'asc'));
  const orders = sortRules.map(rule => rule.direction);

  // If sort involves LIFO ordering (*.desc), we need to add our own index
  if (sortRules.some(isFifoLifo)) {
    return items => orderBy(
      withCreatedIndex(items),
      sortRules.map(rule => (isFifoLifo(rule) ? fifo : rule.property)),
      orders,
    ).map(withoutCreatedIndex);
  }

  /**
   * Returns a list of sorted items
   * @param {array} items - A list of items (nodes) to be sorted
   */
  return items => orderBy(
    items,
    sortRules.map(rule => rule.property),
    orders,
  );
};

export default sortOrder;
