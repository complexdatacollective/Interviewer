/* eslint-disable import/prefer-default-export */

import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';

export const convertNamesToUUIDs = (variables, nameOrNames = []) => {
  if (typeof nameOrNames === 'string') {
    return getParentKeyByNameValue(variables, nameOrNames);
  }

  return nameOrNames.map((name) => getParentKeyByNameValue(variables, name));
};
