import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { get, differenceBy } from 'lodash';
import { makeGetNodeLabel, makeGetNodeTypeDefinition } from '../../../selectors/network';
import {
  makeNetworkNodesForPrompt,
  makeNetworkNodesForOtherPrompts,
} from '../../../selectors/interface';
import { getCardAdditionalProperties } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty, getEntityAttributes } from '../../../ducks/modules/network';
import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';
import usePropSelector from './usePropSelector';

/**
 * Format details needed for list cards
 */
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

const makeGetNodesForList = () => {
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return (state, props) => {
    const externalNodes = get(props, 'externalData.nodes', []);

    // Remove nodes nominated elsewhere (previously a prop called 'showExistingNodes')
    return differenceBy(
      externalNodes,
      networkNodesForOtherPrompts(state, props),
      entityPrimaryKeyProperty,
    );
  };
};

// Returns all nodes associated with lists (external data)
const useItems = (props) => {
  const labelGetter = usePropSelector(makeGetNodeLabel, props, true);
  const nodeTypeDefinition = usePropSelector(makeGetNodeTypeDefinition, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);
  const visibleSupplementaryFields = usePropSelector(getCardAdditionalProperties, props);
  const nodes = usePropSelector(makeGetNodesForList, props, true, shallowEqual);
  const selected = nodesForPrompt.map((item) => item[entityPrimaryKeyProperty]);

  const items = useMemo(() => nodes
    .map(
      (item) => ({
        id: item[entityPrimaryKeyProperty],
        data: { ...item.attributes },
        props: {
          label: labelGetter(item),
          details: detailsWithVariableUUIDs({
            ...props,
            nodeTypeDefinition,
            visibleSupplementaryFields,
          })(item),
        },
      }),
    ), [nodesForPrompt, nodes, labelGetter, nodeTypeDefinition, visibleSupplementaryFields]);

  return [items, { selected }];
};

export default useItems;
