import { isEmpty, findKey } from 'lodash';

/**
 * Utility function that can be used to help with translating external data
 * variable labels to UUIDs, if a match is possible.
 *
 * Assuming that {object} contains other objects, keyed by a UUID, this function
 * first checks if the string to find is a valid key in the object, and returns it
 * if so (equivalent to codebook.node.uuid === toFind )
 *
 * if not, it iterates the keys of the object, and tests the keys of each child object
 * to see if the 'name' property equals {toFind}. This is equivalent to
 * codebook.node.uuid.name === toFind. Where this child object is found, its key within
 * the parent object is returned.
 *
 * Finally, if neither approach finds a UUID, {toFind} is returned.
 */

const getParentKeyByNameValue = (object, toFind) => {
  if (isEmpty(object) || object[toFind]) {
    return toFind;
  }

  // Iterate object keys and return the key (itself )
  const foundKey = findKey(object, (objectItem) => objectItem.name === toFind);

  return foundKey || toFind;
};

export default getParentKeyByNameValue;
