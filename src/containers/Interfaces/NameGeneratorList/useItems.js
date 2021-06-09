import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { differenceBy } from 'lodash';
import { makeGetNodeLabel, makeGetNodeTypeDefinition } from '../../../selectors/network';
import {
  makeNetworkNodesForPrompt,
  makeNetworkNodesForOtherPrompts,
} from '../../../selectors/interface';
import { getCardAdditionalProperties } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty, getEntityAttributes } from '../../../ducks/modules/network';
import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';
import usePropSelector from './usePropSelector';
import useExternalData from '../../../hooks/useExternalData';

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

// Returns all nodes associated with lists (external data)
const useItems = (props) => {
  const [externalData, isLoading] = useExternalData(props.stage.dataSource, props.stage.subject);
  const labelGetter = usePropSelector(makeGetNodeLabel, props, true);
  const nodeTypeDefinition = usePropSelector(makeGetNodeTypeDefinition, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);
  const nodesForOtherPrompts = usePropSelector(makeNetworkNodesForOtherPrompts, props, true);
  const visibleSupplementaryFields = usePropSelector(getCardAdditionalProperties, props);

  const nodes = useMemo(() => {
    if (externalData === null) { return []; }

    return differenceBy(
      externalData,
      nodesForOtherPrompts,
      entityPrimaryKeyProperty,
    );
  }, [externalData, nodesForOtherPrompts]);
  const excludeItems = nodesForPrompt.map((item) => item[entityPrimaryKeyProperty]);

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

  return [isLoading, items, excludeItems];
};

export default useItems;
