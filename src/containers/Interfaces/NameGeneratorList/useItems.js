import { useMemo } from 'react';
import {
  makeGetNodeLabel,
  makeGetNodeTypeDefinition,
  getNetworkNodes,
} from '../../../selectors/network';
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
  const networkNodes = usePropSelector(getNetworkNodes, props);
  const visibleSupplementaryFields = usePropSelector(getCardAdditionalProperties, props);
  const excludeItems = networkNodes.map((item) => item[entityPrimaryKeyProperty]);

  const items = useMemo(() => {
    if (!externalData) { return []; }

    return externalData
      .map((item) => ({
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
      }));
  }, [externalData, labelGetter, nodeTypeDefinition, visibleSupplementaryFields]);

  return [isLoading, items, excludeItems];
};

export default useItems;
