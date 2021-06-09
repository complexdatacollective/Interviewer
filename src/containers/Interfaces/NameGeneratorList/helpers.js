/* eslint-disable import/prefer-default-export */

import { getProtocolCodebook } from '../../../selectors/protocol';

export const getVariableMap = (state) => {
  const codebook = getProtocolCodebook(state);

  return Object
    .keys(codebook.node)
    .flatMap(
      (type) => {
        const node = codebook.node[type];

        if (!node.variables) { return []; }

        return Object
          .keys(node.variables)
          .map(
            (id) => [id, node.variables[id].name],
          );
      },
    );
};
