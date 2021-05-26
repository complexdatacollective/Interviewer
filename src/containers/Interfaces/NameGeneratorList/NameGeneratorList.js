import React, { useMemo, useEffect, useCallback } from 'react';
import { compose } from 'redux';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import { get, differenceBy, curryRight } from 'lodash';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import withExternalData from '../../withExternalData';
import Card from '../../../components/Card';
import { makeGetNodeLabel, makeGetNodeTypeDefinition } from '../../../selectors/network';
import {
  makeNetworkNodesForPrompt,
  makeNetworkNodesForOtherPrompts,
  makeGetAdditionalAttributes,
} from '../../../selectors/interface';
import { getProtocolCodebook } from '../../../selectors/protocol';
import { getCardAdditionalProperties, makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty, getEntityAttributes } from '../../../ducks/modules/network';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';
import SearchableList from './SearchableList';
// import NodeDropArea from './NodeDropArea';
import NodeList from '../../../components/NodeList';

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

const detailsWithVariableUUIDs = (props) => (node) => {
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

// const searchOptions = { matchProperties: [], ...stage.searchOptions };

// // Map the matchproperties to add the entity attributes object, and replace names with
// // uuids, where possible.
// searchOptions.matchProperties = searchOptions.matchProperties.map((prop) => {
//   const nodeTypeVariables = nodeTypeDefinition.variables;
//   const replacedProp = getParentKeyByNameValue(nodeTypeVariables, prop);
//   return (`${entityAttributesProperty}.${replacedProp}`);
// });

// // If false, suppress candidate from appearing in search results —
// // for example, if the node has already been selected.
// // Assumption:
// //   `excludedNodes` size is small, but search set may be large,
// //   and so preferable to filter found results dynamically.
// const isAllowedResult = (candidate) => excludedNodes.every(
//   (excluded) => excluded[entityPrimaryKeyProperty] !== candidate[entityPrimaryKeyProperty],
// );

/**
  * Name Generator List Interface
  */

const usePropSelector = (selector, props, isFactory = false, equalityFn) => {
  const memoizedSelector = useMemo(() => {
    if (isFactory) { return selector(); }
    return selector;
  }, []);

  const selectorWithProps = useCallback(
    (state) => memoizedSelector(state, props),
    [props],
  );

  const state = useSelector(selectorWithProps, equalityFn);

  return state;
};

const NameGeneratorList = (props) => {
  const {
    prompt,
    promptBackward,
    promptForward,
    stage,
  } = props;

  const {
    prompts,
  } = stage;

  const dispatch = useDispatch();
  const newNodeAttributes = usePropSelector(makeGetAdditionalAttributes, props, true);
  const newNodeModelData = usePropSelector(makeGetPromptNodeModelData, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);

  // TODO: Combine this and extract from NameGeneratorList
  const labelGetter = usePropSelector(makeGetNodeLabel, props, true);
  const nodeTypeDefinition = usePropSelector(makeGetNodeTypeDefinition, props, true);
  const visibleSupplementaryFields = usePropSelector(getCardAdditionalProperties, props);
  const nodes = usePropSelector(makeGetNodesForList, props, true, shallowEqual);

  const items = useMemo(() => nodes
    .map(
      (item) => ({
        id: item._uid,
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
    ), [nodes]);
  // End TODO

  const variableMap = useSelector((s) => {
    const codebook = getProtocolCodebook(s);

    return Object
      .keys(codebook.node)
      .flatMap(
        (type) => Object
          .keys(codebook.node[type].variables)
          .map(
            (id) => [id, codebook.node[type].variables[id].name],
          ),
      );
  });

  const sortableProperties = stage.sortOptions && stage.sortOptions.sortableProperties;

  const enhancedSortableProperties = useMemo(
    () => {
      if (!sortableProperties) { return []; }
      return sortableProperties.map((item) => {
        const ref = variableMap.find(([, name]) => name === item.variable);
        const variable = ref ? ref[0] : item.variable;
        return {
          ...item,
          variable,
        };
      });
    },
    [sortableProperties],
  );

  const handleAddNode = ({ meta }) => {
    const { id, data } = meta;
    const attributeData = {
      ...newNodeAttributes,
      ...data,
    };

    const modelData = {
      ...newNodeModelData,
      id,
    };

    console.log('add', { data, modelData, attributeData });

    dispatch(sessionsActions.addNode(modelData, attributeData));
  };

  const handleRemoveNode = ({ meta }) => {
    const id = meta[entityPrimaryKeyProperty];

    console.log('remove', { meta });

    dispatch(sessionsActions.removeNode(id));
  };

  return (
    <div className="name-generator-list-interface">
      <div className="name-generator-list-interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={prompts}
        />
      </div>

      <div className="name-generator-list-interface__panels">
        <div className="name-generator-list-interface__nodes">
          <NodeList
            id="node-drop-area"
            accepts={() => true}
            onDrop={handleAddNode}
            items={nodesForPrompt}
          />
        </div>
        <div className="name-generator-list-interface__list">
          <SearchableList
            items={items}
            itemComponent={Card}
            sortableProperties={enhancedSortableProperties}
            onDrop={handleRemoveNode}
          />
        </div>
      </div>
    </div>
  );
};

NameGeneratorList.propTypes = {
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorList.defaultProps = {

};

export default compose(
  withPrompt,
  withExternalData('stage.dataSource', 'externalData'),
)(NameGeneratorList);
