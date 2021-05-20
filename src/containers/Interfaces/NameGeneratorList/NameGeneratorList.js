import React, { useMemo } from 'react';
import { compose } from 'redux';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { get, differenceBy } from 'lodash';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import withExternalData from '../../withExternalData';
import Card from '../../../components/Card';
import { makeGetNodeLabel, makeGetNodeTypeDefinition } from '../../../selectors/network';
import { makeNetworkNodesForOtherPrompts } from '../../../selectors/interface';
import { getProtocolCodebook } from '../../../selectors/protocol';
import { getCardAdditionalProperties } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty, getEntityAttributes } from '../../../ducks/modules/network';
import getParentKeyByNameValue from '../../../utils/getParentKeyByNameValue';
import SearchableList from './SearchableList';

const makeGetNodesForList = (props) => {
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return (state) => {
    const externalNodes = get(props, 'externalData.nodes', []);

    // Remove nodes nominated elsewhere (previously a prop called 'showExistingNodes')
    return differenceBy(
      externalNodes,
      networkNodesForOtherPrompts(state, props),
      entityPrimaryKeyProperty,
    );
  };
};

const withProps = (fn, props) => (state) => fn(state, props);

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

/**
  * Name Generator List Interface
  */

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

  const labelGetter = useSelector(withProps(makeGetNodeLabel(), props));
  const nodeTypeDefinition = useSelector(withProps(makeGetNodeTypeDefinition(), props));
  const visibleSupplementaryFields = useSelector(withProps(
    getCardAdditionalProperties,
    props,
  ));

  const items = useSelector(makeGetNodesForList(props)).map((item) => ({
    ...item,
    label: labelGetter(item),
    details: detailsWithVariableUUIDs({
      ...props,
      nodeTypeDefinition,
      visibleSupplementaryFields,
    })(item),
  }));

  // const variableMap = useSelector((s) => {
  //   const codebook = getProtocolCodebook(s);

  //   return Object
  //     .keys(codebook.node)
  //     .flatMap(
  //       (type) => Object
  //         .keys(codebook.node[type].variables)
  //         .map(
  //           (id) => [id, codebook.node[type].variables[id].name],
  //         ),
  //     );
  // });

  // const sortableProperties = stage.sortOptions && stage.sortOptions.sortableProperties;

  // const enhancedSortableProperties = useMemo(
  //   () => {
  //     if (!sortableProperties) { return []; }
  //     return sortableProperties.map((item) => {
  //       const ref = variableMap.find(([, name]) => name === item.variable);
  //       const variable = ref ? ref[0] : item.variable;
  //       return {
  //         ...item,
  //         variable,
  //       };
  //     });
  //   },
  //   [sortableProperties],
  // );


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

      <SearchableList
        items={items}
        itemComponent={Card}
        // sortableProperties={enhancedSortableProperties}
      />
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
