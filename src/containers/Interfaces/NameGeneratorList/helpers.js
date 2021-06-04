/* eslint-disable import/prefer-default-export */

import { getProtocolCodebook } from '../../../selectors/protocol';

export const getVariableMap = (state) => {
  const codebook = getProtocolCodebook(state);

  return Object
    .keys(codebook.node)
    .flatMap(
      (type) => Object
        .keys(codebook.node[type].variables)
        .map(
          (id) => [id, codebook.node[type].variables[id].name],
        ),
    );
};
