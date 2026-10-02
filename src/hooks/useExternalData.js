import { mapKeys, mapValues } from 'lodash';
import { hash as objectHash } from 'ohash';
import { useEffect, useMemo, useState } from 'react';
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

  const sourceFile = assetFiles[dataSource];
  const manifestEntry = assetManifest[dataSource];

  // Keyed by the request (every value the loader depends on) that produced
  // it, so a response for a stale request can never overwrite a newer
  // request's result. `undefined` can never match a real dataSource, so a
  // fresh request correctly reads as "not yet loaded" from the first render
  // it's active, instead of needing a synchronous reset in the effect.
  const [result, setResult] = useState({
    dataSource: undefined,
    sourceFile: undefined,
    manifestEntry: undefined,
    protocolCodebook: undefined,
    protocolUID: undefined,
    subject: undefined,
    data: null,
    error: null,
  });

  const isCurrentRequest =
    Object.is(result.dataSource, dataSource) &&
    Object.is(result.sourceFile, sourceFile) &&
    Object.is(result.manifestEntry, manifestEntry) &&
    Object.is(result.protocolCodebook, protocolCodebook) &&
    Object.is(result.protocolUID, protocolUID) &&
    Object.is(result.subject, subject);

  const externalData = isCurrentRequest ? result.data : null;
  const status = useMemo(
    () => ({
      isLoading: !!dataSource && !isCurrentRequest,
      error: isCurrentRequest ? result.error : null,
    }),
    [dataSource, isCurrentRequest, result.error],
  );

  useEffect(() => {
    if (!dataSource) {
      return;
    }

    const variableUUIDReplacer = makeVariableUUIDReplacer(
      protocolCodebook,
      subject,
    );

    loadExternalData(protocolUID, sourceFile, manifestEntry.type)
      .then(({ nodes }) => Promise.all(nodes.map(variableUUIDReplacer)))
      .then((uuidData) =>
        getVariableTypeReplacements(
          sourceFile,
          uuidData,
          protocolCodebook,
          subject,
        ),
      )
      .then((formattedData) =>
        setResult({
          dataSource,
          sourceFile,
          manifestEntry,
          protocolCodebook,
          protocolUID,
          subject,
          data: formattedData,
          error: null,
        }),
      )
      .catch((e) =>
        setResult({
          dataSource,
          sourceFile,
          manifestEntry,
          protocolCodebook,
          protocolUID,
          subject,
          data: null,
          error: e,
        }),
      );
  }, [
    dataSource,
    sourceFile,
    manifestEntry,
    protocolCodebook,
    protocolUID,
    subject,
  ]);

  return [externalData, status];
};

export default useExternalData;
