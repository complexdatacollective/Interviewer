import {
  isEmpty, find, findKey, has,
} from 'lodash';

const findCategoricalKey = (object, toFind) => {
  // make list of possible var_option pairs
  let previousIndex = 0;
  const collection = [];
  while (toFind.indexOf('_', previousIndex) !== -1) {
    previousIndex = toFind.indexOf('_', previousIndex) + 1;
    const name = toFind.substr(0, previousIndex - 1);
    const option = toFind.substr(previousIndex, toFind.length);
    if (name && option) {
      collection.push({ name, option });
    }
  }
  let foundKey = '';
  // check for a categorical variable with a valid option value
  const categoricalVariable = collection.find((pair) => {
    foundKey = findKey(object, (objectItem) => objectItem.name.toString() === pair.name.toString());
    return (foundKey && has(object[foundKey], 'options')
      && find(object[foundKey].options,
        (option) => option.value.toString() === pair.option.toString()));
  });
  if (has(categoricalVariable, 'option')) {
    return `${foundKey}_${categoricalVariable.option}`;
  }
  return null;
};

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
  let foundKey = findKey(object, (objectItem) => objectItem.name === toFind);

  // check for special cases
  // possible location
  if (!foundKey && toFind && (toFind.endsWith('_x') || toFind.endsWith('_y'))) {
    const locationName = toFind.substring(0, toFind.length - 2);
    foundKey = findKey(object, (objectItem) => objectItem.name === locationName);
    if (foundKey) {
      foundKey += toFind.substring(toFind.length - 2);
    }
  }
  // possible categorical
  if (!foundKey && toFind && toFind.includes('_')) {
    foundKey = findCategoricalKey(object, toFind);
  }

  return foundKey || toFind;
};

export default getParentKeyByNameValue;
