import { mapKeys, mapValues } from 'lodash';
import { hash as objectHash } from 'ohash';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
} from '@codaco/shared-consts';

import { getVariableTypeReplacements } from '../containers/withExternalData';
import getParentKeyByNameValue from '../utils/getParentKeyByNameValue';
import loadExternalData from '../utils/loadExternalData';

const getSessionMeta = (state) => {
  const session = state.sessions[state.activeSessionId];
  const { protocolUID } = session;
  const protocolCodebook = state.installedProtocols[protocolUID].codebook;
  const { assetManifest } = state.installedProtocols[protocolUID];
  const assetFiles = mapValues(assetManifest, (asset) => asset.source);

  return {
    protocolUID,
    assetManifest,
    assetFiles,
    protocolCodebook,
  };
};

const withUUID = (node) => objectHash(node);

// Replace string keys with UUIDs in codebook, according to stage subject.
const makeVariableUUIDReplacer = (protocolCodebook, stageSubject) => (node) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const stageNodeType = stageSubject.type;
      const codebookDefinition = protocolCodebook.node[stageNodeType] || {};

      const uuid = withUUID(node);

      const attributes = mapKeys(
        node.attributes,
        (_attributeValue, attributeKey) =>
          getParentKeyByNameValue(codebookDefinition.variables, attributeKey),
      );

      resolve({
        type: stageNodeType,
        [entityPrimaryKeyProperty]: uuid,
        [entityAttributesProperty]: attributes,
      });
    }, 0);
  });

const useExternalData = (dataSource, subject) => {
  const { protocolUID, assetManifest, assetFiles, protocolCodebook } =
    useSelector(getSessionMeta);

  const [externalData, setExternalData] = useState(null);
  const [status, setStatus] = useState({ isLoading: false, error: null });
  // Stable identity so it doesn't retrigger the effect below on every render
  // (an unstable dep here re-runs the loader each render -> worker spawn loop).
  const updateStatus = useCallback(
    (newStatus) => setStatus((s) => ({ ...s, ...newStatus })),
    [],
  );

  useEffect(() => {
    if (!dataSource) {
      return;
    }
    // This is where we could set the loading state for URL assets
    setExternalData(null);
    updateStatus({ isLoading: true, error: null });

    const sourceFile = assetFiles[dataSource];
    const { type } = assetManifest[dataSource];

    const variableUUIDReplacer = makeVariableUUIDReplacer(
      protocolCodebook,
      subject,
    );

    loadExternalData(protocolUID, sourceFile, type)
      .then(({ nodes }) => Promise.all(nodes.map(variableUUIDReplacer)))
      .then((uuidData) =>
        getVariableTypeReplacements(
          sourceFile,
          uuidData,
          protocolCodebook,
          subject,
        ),
      )
      .then((formattedData) => setExternalData(formattedData))
      .then(() => updateStatus({ isLoading: false }))
      .catch((e) => updateStatus({ isLoading: false, error: e }));
  }, [
    dataSource,
    assetFiles[dataSource],
    assetManifest[dataSource],
    protocolCodebook,
    protocolUID,
    subject,
    updateStatus,
  ]);

  return [externalData, status];
};

export default useExternalData;
