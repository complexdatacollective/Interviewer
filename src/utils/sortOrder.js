import { isArray, orderBy } from 'lodash';

/* Maps a `createdIndex` index value to all items in an array */
const withCreatedIndex = items => items.map((item, createdIndex) => ({ ...item, createdIndex }));

/* property iteratee for the special case "*" property, which sorteds by `createdIndex` */
const fifo = ({ createdIndex }) => createdIndex;

/**
 * Returns a configured sorting function
 * @param {array} sortConfiguration - The title of the book.
 * @param {object} variableRegistry - an object containing variables for the node type as specified
 * at: `variableRegistry.node[nodeType]variables`
 * TODO: Use variable registry to respect variable type?
 */
const sortOrder = (sortConfiguration = [], variableRegistry = {}) => { // eslint-disable-line
  if (!isArray(sortConfiguration)) {
    return items => items; // ignore sort from old protocol format
  }

  const iteratees = sortConfiguration.map(rule => rule.property)
    .map(property => (property === '*' ? fifo : property));

  const orders = sortConfiguration.map(rule => rule.direction);

  /**
   * Returns a list of sorted items
   * @param {array} items - A list of items (nodes) to be sorted
   */
  return items =>
    orderBy(
      withCreatedIndex(items),
      iteratees,
      orders,
    );
};

export default sortOrder;
