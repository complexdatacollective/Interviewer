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
  mapValues,
  mapKeys,
} from 'lodash';
import loadExternalData from '../utils/loadExternalData';
import getParentKeyByNameValue from '../utils/getParentKeyByNameValue';
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
        .then((externalData) => {
          setExternalDataIsLoading(false);
          setExternalData({
            nodes:
                  withVariableUUIDReplacement(externalData.nodes, protocolCodebook, stageSubject),
          });
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
