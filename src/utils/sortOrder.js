import { orderBy } from 'lodash';
import { entityAttributesProperty } from '../ducks/modules/network';

/* Maps a `createdIndex` index value to all items in an array */
const withCreatedIndex = (items) => items.map((item, createdIndex) => ({ ...item, createdIndex }));

/* all items without the 'createdIndex' prop */
const withoutCreatedIndex = (items) => items
  .map(({ createdIndex, ...originalItem }) => originalItem);

/* property iteratee for the special case "*" property, which sorts by `createdIndex` */
const fifo = ({ createdIndex }) => createdIndex;

/**
 * Returns a configured sorting function
 * @param {Array} sortConfig - list of rules to sort by, as an array of objects where each object
 * has two properties ("property", and "direction"), and direction can be either "asc" or "desc".
 * @param {Object} codebook - an object containing variables for the node type as specified
 * at: `codebook.node[nodeType]variables`
 * TODO: Use variable registry to respect variable type?
 */
const sortOrder = (sortConfig = [], codebook = {}, attributePath = entityAttributesProperty) => { // eslint-disable-line
  // '*' is a special prop to sort by the order in which nodes were added to the network
  const isFifoLifo = (rule) => rule.property === '*';

  // Lodash sort is stable; we can discard any fifo (*.asc) rules as no-ops.
  const sortRules = sortConfig.filter((rule) => !(isFifoLifo(rule) && rule.direction === 'asc'));
  const orders = sortRules.map((rule) => rule.direction);

  // If sort involves LIFO ordering (*.desc), we need to add our own index during the sort
  if (sortRules.some(isFifoLifo)) {
    return (items) => withoutCreatedIndex(
      orderBy(
        withCreatedIndex(items),
        sortRules.map((rule) => (isFifoLifo(rule) ? fifo : rule.property)),
        orders,
      ),
    );
  }

  const rulePath = (rule) => (attributePath ? `${attributePath}.${rule.property}` : rule.property);

  /**
   * Returns a list of sorted items
   * @param {array} items - A list of items (nodes) to be sorted
   */
  return (items) => orderBy(
    items,
    sortRules.map(rulePath),
    orders,
  );
};

export default sortOrder;
