/* eslint-disable no-underscore-dangle */
import { connect } from 'react-redux';
import objectHash from 'object-hash';
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
  mapValues,
  mapKeys,
  toNumber,
} from 'lodash';
import loadExternalData from '../utils/loadExternalData';
import getParentKeyByNameValue from '../utils/getParentKeyByNameValue';
import ProtocolConsts from '../protocol-consts';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../ducks/modules/network';

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

// Replace string keys with UUIDs in codebook, according to stage subject.
const withVariableUUIDReplacement = (nodeList, protocolCodebook, stageSubject) => nodeList.map(
  (node) => {
    const stageNodeType = stageSubject.type;
    const codebookDefinition = protocolCodebook.node[stageNodeType] || {};

    const uuid = withUUID(node);

    const attributes = mapKeys(
      node.attributes,
      (attributeValue, attributeKey) => getParentKeyByNameValue(
        codebookDefinition.variables,
        attributeKey,
      ),
    );

    return {
      type: stageNodeType,
      [entityPrimaryKeyProperty]: uuid,
      [entityAttributesProperty]: attributes,
    };
  },
);

// compile list of attributes from a nodelist that aren't already in the codebook
const getUniqueAttributeKeys = (nodeList, protocolCodebook, stageSubject) => (
  nodeList.reduce((attributeKeys, node) => {
    const stageNodeType = stageSubject.type;
    const codebookDefinition = protocolCodebook.node[stageNodeType] || {};
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
const deriveAttributeTypesFromData = (uniqueAttributeKeys, nodeList) => (
  uniqueAttributeKeys.reduce((keyTypeMap, attributeKey) => {
    const derivedType = nodeList.reduce((previousType, node) => {
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
    }, '');
    return { ...keyTypeMap, [attributeKey]: derivedType };
  }, {})
);

const getNodeListUsingTypes = (nodeList, protocolCodebook, stageSubject, derivedAttributeTypes) => (
  nodeList.map(
    (node) => {
      const stageNodeType = stageSubject.type;
      const codebookDefinition = protocolCodebook.node[stageNodeType] || {};

      const attributes = mapValues(
        node.attributes,
        (attributeValue, attributeKey) => {
          let codebookType = get(codebookDefinition, `variables[${attributeKey}].type`);
          if (!includes(ProtocolConsts.VariableType, codebookType)) {
            // use type based on column data because the codebook type wasn't valid
            codebookType = derivedAttributeTypes[attributeKey];
          }

          switch (codebookType) {
            case ProtocolConsts.VariableType.boolean: {
              return String(attributeValue).toLowerCase() === 'true';
            }
            case ProtocolConsts.VariableType.number:
            case ProtocolConsts.VariableType.scalar: {
              return toNumber(attributeValue);
            }
            case ProtocolConsts.VariableType.categorical:
            case ProtocolConsts.VariableType.ordinal:
            case ProtocolConsts.VariableType.layout: {
              try {
                // do special characters need to be sanitized/escaped?
                return JSON.parse(attributeValue);
              } catch (e) {
                return attributeValue;
              }
            }
            case ProtocolConsts.VariableType.datetime:
            case ProtocolConsts.VariableType.text:
            default:
              return attributeValue;
          }
        },
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

  // look up best guess for type of each key based on the column data
  const derivedAttributeTypes = deriveAttributeTypesFromData(uniqueAttributeKeys, nodeList);

  // make substitutes using codebook first, then column data derivation
  return getNodeListUsingTypes(nodeList, protocolCodebook, stageSubject, derivedAttributeTypes);
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
        .then((uuidData) => {
          const fileExtension = (fileName) => fileName.split('.').pop();
          const fileType = fileExtension(sourceFile) === 'csv' ? 'csv' : 'json';
          if (fileType === 'csv') {
            return withTypeReplacement(uuidData, protocolCodebook, stageSubject);
          }
          return uuidData;
        })
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
