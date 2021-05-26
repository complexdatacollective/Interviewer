/* eslint-disable import/prefer-default-export */
import { getProtocolCodebook } from '../../../selectors/protocol';
import { getEntityAttributes } from '../../../ducks/modules/network';
import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';

export const detailsWithVariableUUIDs = (props) => (node) => {
  const {
    nodeTypeDefinition,
    visibleSupplementaryFields,
  } = props;

  const nodeTypeVariables = nodeTypeDefinition.variables;
  const attrs = getEntityAttributes(node);
  const fields = visibleSupplementaryFields;
  const withUUIDReplacement = fields.map((field) => ({
    ...field,
    variable: getParentKeyByNameValue(nodeTypeVariables, field.variable),
  }));

  return withUUIDReplacement.map((field) => ({ [field.label]: attrs[field.variable] }));
};

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
