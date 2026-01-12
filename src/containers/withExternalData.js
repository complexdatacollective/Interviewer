/* eslint-disable no-underscore-dangle */
import { connect } from 'react-redux';
import { hash as objectHash } from 'ohash';
import {
  compose,
  withState,
  withHandlers,
  lifecycle,
  mapProps,
} from 'recompose';
import {
  get,
  includes,
  isNil,
  mapValues,
  mapKeys,
  toNumber,
  reduce,
} from 'lodash';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import loadExternalData from '../utils/loadExternalData';
import getParentKeyByNameValue from '../utils/getParentKeyByNameValue';
import ProtocolConsts from '../protocol-consts';

const mapStateToProps = (state) => {
  const session = state.sessions[state.activeSessionId];
  const { protocolUID } = session;
  const protocolCodebook = state.installedProtocols[protocolUID].codebook;
  const { assetManifest } = state.installedProtocols[protocolUID];
  const assetFiles = mapValues(
    assetManifest,
    (asset) => asset.source,
  );

  return {
    protocolUID,
    assetManifest,
    assetFiles,
    protocolCodebook,
  };
};

const withUUID = (node) => objectHash(node);

const getCodebookDefinition = (protocolCodebook, stageSubject) => {
  const stageNodeType = stageSubject.type;
  const entityType = stageSubject.entity;
  if (entityType === 'ego') {
    return protocolCodebook[entityType] || {};
  }
  return protocolCodebook[entityType][stageNodeType] || {};
};

// Replace string keys with UUIDs in codebook, according to stage subject.
const withVariableUUIDReplacement = (nodeList, protocolCodebook, stageSubject) => nodeList.map(
  (node) => {
    const codebookDefinition = getCodebookDefinition(protocolCodebook, stageSubject);

    const uuid = withUUID(node);

    const attributes = mapKeys(
      node.attributes,
      (attributeValue, attributeKey) => getParentKeyByNameValue(
        codebookDefinition.variables,
        attributeKey,
      ),
    );

    return {
      type: stageSubject.type,
      [entityPrimaryKeyProperty]: uuid,
      [entityAttributesProperty]: attributes,
    };
  },
);

// compile list of attributes from a nodelist that aren't already in the codebook
const getUniqueAttributeKeys = (nodeList, protocolCodebook, stageSubject) => (
  nodeList.reduce((attributeKeys, node) => {
    const codebookDefinition = getCodebookDefinition(protocolCodebook, stageSubject);
    const variables = Object.keys(node.attributes);
    const nonCodebookVariables = variables.filter(
      (attributeKey) => !get(codebookDefinition, `variables[${attributeKey}]`),
    );
    const novelVariables = nonCodebookVariables.filter(
      (attributeKey) => !attributeKeys.includes(attributeKey),
    );
    return [...attributeKeys, ...novelVariables];
  }, [])
);

// use column data to determine best guess for attribute type
const deriveAttributeTypeFromData = (attributeKey, nodeList) => (
  nodeList.reduce((previousType, node) => {
    const currentValue = get(node, `[${entityAttributesProperty}][${attributeKey}]`);
    if (!currentValue || previousType === ProtocolConsts.VariableType.text) {
      return previousType;
    }
    let currentType = '';
    if (!Number.isNaN(toNumber(currentValue))) {
      currentType = ProtocolConsts.VariableType.number;
    }
    if (String(currentValue).toLowerCase() === 'true' || String(currentValue).toLowerCase() === 'false') {
      currentType = ProtocolConsts.VariableType.boolean;
    }
    // could insert regex for array/object detection, but not helpful if not in the codebook

    // fallback to text if a conflict emerges, or first instance of non-null data
    if ((previousType !== '' && currentType !== previousType) || (currentType === '' && !!currentValue)) {
      return ProtocolConsts.VariableType.text;
    }
    return currentType;
  }, '')
);

const getAttributeTypes = (uniqueAttributeKeys, nodeList, protocolCodebook, stageSubject) => (
  uniqueAttributeKeys.reduce((derivedTypes, attributeKey) => {
    const codebookDefinition = getCodebookDefinition(protocolCodebook, stageSubject);
    let codebookType = get(codebookDefinition, `variables[${attributeKey}].type`);
    if (includes(ProtocolConsts.VariableType, codebookType)) {
      return { ...derivedTypes, [attributeKey]: codebookType };
    }
    // possible categorical or layout variable
    if (attributeKey.includes('_')) {
      const uuid = attributeKey.substring(0, attributeKey.indexOf('_'));
      const option = attributeKey.substring(attributeKey.indexOf('_'));
      codebookType = get(codebookDefinition, `variables[${uuid}].type`);
      if (includes(ProtocolConsts.VariableType, codebookType)) {
        if (option === '_x' || option === '_y') {
          return { ...derivedTypes, [attributeKey]: `${codebookType}${option}` };
        }
        return { ...derivedTypes, [attributeKey]: `${codebookType}_option` };
      }
    }
    // use type based on column data because the codebook type wasn't valid
    codebookType = deriveAttributeTypeFromData(attributeKey, nodeList);
    return { ...derivedTypes, [attributeKey]: codebookType };
  }, {})
);

const getNodeListUsingTypes = (nodeList, protocolCodebook, stageSubject, derivedAttributeTypes) => (
  nodeList.map(
    (node) => {
      const codebookDefinition = getCodebookDefinition(protocolCodebook, stageSubject);
      const attributes = reduce(
        node.attributes,
        (consolidatedAttributes, attributeValue, attributeKey) => {
          if (isNil(attributeValue) || attributeValue === '') {
            return consolidatedAttributes;
          }

          let codebookType = get(codebookDefinition, `variables[${attributeKey}].type`);
          if (!includes(ProtocolConsts.VariableType, codebookType)) {
            // use type based on column data because the codebook type wasn't valid
            codebookType = derivedAttributeTypes[attributeKey];
          }

          switch (codebookType) {
            case ProtocolConsts.VariableType.boolean: {
              return { ...consolidatedAttributes, [attributeKey]: String(attributeValue).toLowerCase() === 'true' };
            }
            case ProtocolConsts.VariableType.number:
            case ProtocolConsts.VariableType.scalar: {
              return { ...consolidatedAttributes, [attributeKey]: toNumber(attributeValue) };
            }
            case ProtocolConsts.VariableType.categorical:
            case ProtocolConsts.VariableType.ordinal:
            case ProtocolConsts.VariableType.layout: {
              try {
                // do special characters need to be sanitized/escaped?
                return { ...consolidatedAttributes, [attributeKey]: JSON.parse(attributeValue) };
              } catch (e) {
                return { ...consolidatedAttributes, [attributeKey]: attributeValue };
              }
            }
            case `${ProtocolConsts.VariableType.layout}_x`: {
              const uuid = attributeKey.substring(0, attributeKey.indexOf('_'));
              return {
                ...consolidatedAttributes,
                [uuid]: { ...consolidatedAttributes[uuid], x: toNumber(attributeValue) },
              };
            }
            case `${ProtocolConsts.VariableType.layout}_y`: {
              const uuid = attributeKey.substring(0, attributeKey.indexOf('_'));
              return {
                ...consolidatedAttributes,
                [uuid]: { ...consolidatedAttributes[uuid], y: toNumber(attributeValue) },
              };
            }
            case `${ProtocolConsts.VariableType.categorical}_option`: {
              if (String(attributeValue).toLowerCase() === 'true') {
                const uuid = attributeKey.substring(0, attributeKey.indexOf('_'));
                const option = attributeKey.substring(attributeKey.indexOf('_') + 1);
                const previousOptions = consolidatedAttributes[uuid] || [];
                try {
                  return {
                    ...consolidatedAttributes,
                    [uuid]: [...previousOptions, JSON.parse(option)],
                  };
                } catch (e) {
                  return { ...consolidatedAttributes, [uuid]: [...previousOptions, option] };
                }
              }
              return consolidatedAttributes;
            }
            case ProtocolConsts.VariableType.datetime:
            case ProtocolConsts.VariableType.text:
            default:
              return { ...consolidatedAttributes, [attributeKey]: attributeValue };
          }
        }, {},
      );

      return {
        ...node,
        [entityAttributesProperty]: attributes,
      };
    },
  )
);

// Cast types for data based on codebook and data, according to stage subject.
const withTypeReplacement = (nodeList, protocolCodebook, stageSubject) => {
  const uniqueAttributeKeys = getUniqueAttributeKeys(nodeList, protocolCodebook, stageSubject);

  const codebookAttributeTypes = getAttributeTypes(
    uniqueAttributeKeys, nodeList, protocolCodebook, stageSubject,
  );

  // make substitutes using codebook first, then column data derivation
  return getNodeListUsingTypes(nodeList, protocolCodebook, stageSubject, codebookAttributeTypes);
};

export const getVariableTypeReplacements = (
  sourceFile, uuidData, protocolCodebook, stageSubject,
) => {
  const fileExtension = (fileName) => fileName.split('.').pop();
  const fileType = fileExtension(sourceFile) === 'csv' ? 'csv' : 'json';
  if (fileType === 'csv') {
    return withTypeReplacement(uuidData, protocolCodebook, stageSubject);
  }
  return uuidData;
};

/**
 * Creates a higher order component which can be used to load data from network assets in
 * the assetsManifest onto a component.
 *
 * @param {string} sourceProperty - prop containing the sourceId to load
 * @param {string} dataProperty - prop name to supply the data to the child component.
 *
 * Usage:
 *
 * ```
 * // in MyComponent.js
 * // print out the json data as a string.
 * const MyComponent = ({ myExternalData }) => (
 *   <div>{JSON.stringify(myExternalData}}</div>
 * );
 *
 * export default withExternalData('mySourceId', 'myExternalData')(MyComponent);
 *
 * // in jsx block:
 *
 * <MyComponent mySourceId="hivServices" />
 * ```
 */
const withExternalData = (sourceProperty, dataProperty) => compose(
  connect(mapStateToProps),
  withState(
    dataProperty, // State name
    'setExternalData', // State updater name
    null, // initialState
  ),
  withState(
    `${dataProperty}__isLoading`, // State name
    'setExternalDataIsLoading', // State updater name
    false, // initialState
  ),
  withHandlers({
    loadExternalData: ({
      setExternalData,
      setExternalDataIsLoading,
      protocolUID,
      assetFiles,
      assetManifest,
      protocolCodebook,
    }) => (sourceId, stageSubject) => {
      if (!sourceId) { return; }
      // This is where we could set the loading state for URL assets
      setExternalData(null);
      setExternalDataIsLoading(true);

      const sourceFile = assetFiles[sourceId];
      const { type } = assetManifest[sourceId];

      loadExternalData(protocolUID, sourceFile, type)
        .then((externalData) => (
          withVariableUUIDReplacement(externalData.nodes, protocolCodebook, stageSubject)
        ))
        .then((uuidData) => getVariableTypeReplacements(
          sourceFile, uuidData, protocolCodebook, stageSubject,
        ))
        .then((nodes) => {
          setExternalDataIsLoading(false);
          setExternalData({ nodes });
        });
    },
  }),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      const nextSource = get(nextProps, sourceProperty);
      const currentSource = get(this.props, sourceProperty);

      if (nextSource !== currentSource) {
        this.props.loadExternalData(nextSource, this.props.stage.subject);
      }
    },
    componentDidMount() {
      const source = get(this.props, sourceProperty);

      if (!source) { return; }
      this.props.loadExternalData(source, this.props.stage.subject);
    },
  }),
  mapProps(
    ({
      setAbortController,
      abortController,
      setExternalData,
      loadExternalData: _, // shadows upper scope otherwise
      ...props
    }) => props,
  ),
);

export default withExternalData;
