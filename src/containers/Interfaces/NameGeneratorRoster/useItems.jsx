import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import {
  makeGetNodeTypeDefinition,
  getNetworkNodes,
  makeGetNodeLabel,
} from '../../../selectors/network';
import { getCardAdditionalProperties } from '../../../selectors/name-generator';
import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';
import usePropSelector from './usePropSelector';
import useExternalData from '../../../hooks/useExternalData';
import { getEntityAttributes } from '../../../ducks/modules/network';

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

  return withUUIDReplacement.reduce(
    (memo, field) => ({
      ...memo,
      [field.label]: attrs[field.variable],
    }),
    {},
  );
};

// Returns all nodes associated with lists (external data)
const useItems = (props) => {
  const getNodeLabel = useSelector((state) => (
    makeGetNodeLabel()(state, props)
  ));
  const [externalData, status] = useExternalData(props.stage.dataSource, props.stage.subject);
  const nodeTypeDefinition = usePropSelector(makeGetNodeTypeDefinition, props, true);
  const networkNodes = usePropSelector(getNetworkNodes, props);
  const visibleSupplementaryFields = usePropSelector(getCardAdditionalProperties, props);
  const excludeItems = networkNodes.map((item) => item[entityPrimaryKeyProperty]);

  const items = useMemo(() => {
    if (!externalData) { return []; }

    return externalData
      .map((item) => ({
        id: item[entityPrimaryKeyProperty],
        data: item,
        props: {
          label: getNodeLabel(item),
          data: detailsWithVariableUUIDs({
            ...props,
            nodeTypeDefinition,
            visibleSupplementaryFields,
          })(item),
        },
      }));
  }, [externalData, getNodeLabel, nodeTypeDefinition, visibleSupplementaryFields]);

  return [status, items, excludeItems];
};

export default useItems;
