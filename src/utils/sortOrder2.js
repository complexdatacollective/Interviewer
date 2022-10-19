import {
  get,
  isNull,
  isUndefined,
  orderBy,
} from 'lodash';

/**
 * Extends lodash orderBy to support putting null and undefined values at the
 * end of the list when sorting in ascending order.
 *
 * Adapted from: https://stackoverflow.com/questions/41138820/lodash-orderby-with-null-and-real-values-not-ordering-correctly
 */
const orderByFix = (
  array,
  orderKeys,
  orderDirs,
) => {
  const ordered = orderBy(array, orderKeys, orderDirs);
  const withProp = ordered.filter((orderedItem) => orderKeys.every((orderKey) => {
    if (typeof orderKey === 'string') {
      return orderedItem[orderKey];
    }

    if (typeof orderKey === 'function') {
      return orderKey(orderedItem);
    }

    throw Error(`Order key must be string or function not ${typeof orderKey}`);
  }));

  const withoutProp = ordered.filter(
    (orderedItem) => !orderKeys.every((orderKey) => {
      if (typeof k === 'string') {
        return orderedItem[orderKey];
      }

      if (typeof orderKey === 'function') {
        return orderKey(orderedItem);
      }

      throw Error(`Order key must be string or function not ${typeof orderKey}`);
    }),
  );
  return [...withProp, ...withoutProp];
};

/* Maps a `_createdIndex` index value to all items in an array */
const withCreatedIndex = (items) => items.map(
  (item, _createdIndex) => ({ ...item, _createdIndex }),
);

/* all items without the '_createdIndex' prop */
const withoutCreatedIndex = (items) => items
  .map(({ _createdIndex, ...originalItem }) => originalItem);

// '*' is a special prop to sort by the order in which nodes were added to the network
const isFifoLifo = (rule) => rule.property === '*';

// _nodeType is a special prop to sort by the node type
const isNodeType = (rule) => rule.property === '_nodeType';

const getRuleIterator = (rule) => {
  // '*' is a special prop to sort by the order in which nodes were added to
  // the network
  if (isFifoLifo(rule)) {
    return ({ _createdIndex }) => _createdIndex;
  }

  // _nodeType is a special prop to sort by the node type using a user supplied
  // hierarchy
  if (isNodeType(rule)) {
    const {
      hierarchy = [],
    } = rule;

    return (item) => {
      // If the item is not in the hierarchy, it should be sorted to the end of
      // the list
      if (!hierarchy.includes(item.type)) {
        return hierarchy.length;
      }

      return hierarchy.indexOf(item.type);
    };
  }

  return (item) => {
    const propertyValue = get(item, rule.property, null);
    // If the item does not have the property, it should be sorted to the end of
    // the list, which varies depending on the direction of the sort
    if (isNull(propertyValue) || isUndefined(propertyValue)) {
      if (rule.direction === 'asc') {
        return 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
      }

      return '0';
    }

    return propertyValue;
  };
};

const getRuleDirection = (rule) => {
  // Node type rules are always considered to be ascending because they are
  // sorted by a user supplied hierarchy
  if (isNodeType(rule)) {
    return 'asc';
  }

  return rule.direction;
};

const sortOrder = (sortRules = []) => {
  return (items) => withoutCreatedIndex(
    orderBy(
      withCreatedIndex(items),
      sortRules.map(getRuleIterator),
      sortRules.map(getRuleDirection),
    ),
  );
};

export default sortOrder;
