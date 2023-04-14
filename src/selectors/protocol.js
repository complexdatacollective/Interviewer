import uuid from 'uuid/v4';
import {
  orderBy,
  values,
  mapValues,
  omit,
} from 'lodash';
import { createSelector } from 'reselect';
import { entityAttributesProperty } from '@codaco/shared-consts';
import { get } from '../utils/lodash-replacements';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuid(),
  type: 'FinishSession',
  label: 'Finish Interview',
};

const getActiveSession = (state) => (
  state.activeSessionId && state.sessions[state.activeSessionId]
);

const getLastActiveSession = (state) => {
  if (Object.keys(state.sessions).length === 0) {
    return {};
  }

  const sessionsCollection = values(mapValues(state.sessions, (session, sessionUUID) => ({
    sessionUUID,
    ...session,
  })));

  const lastActive = orderBy(sessionsCollection, ['updatedAt', 'caseId'], ['desc', 'asc'])[0];
  return {
    sessionUUID: lastActive.sessionUUID,
    [entityAttributesProperty]: {
      ...omit(lastActive, 'sessionUUID'),
    },
  };
};

export const getInstalledProtocols = (state) => state.installedProtocols;

export const getCurrentSessionProtocol = createSelector(
  (state, props) => getActiveSession(state, props),
  getInstalledProtocols,
  (session, protocols) => {
    if (!session) {
      return {};
    }
    return protocols[session.protocolUID];
  },
);

// Use the protocol associated with the last active session, unless there is a protocol with
// an `installationDate` that is more recent.
export const getLastActiveProtocol = (state) => {
  const installedProtocols = getInstalledProtocols(state);

  if (Object.keys(installedProtocols).length === 0) {
    return null;
  }

  const lastActiveSession = getLastActiveSession(state);
  const lastActiveAttributes = lastActiveSession[entityAttributesProperty];

  const protocolsCollection = values(mapValues(installedProtocols, (protocol, protocolUID) => ({
    protocolUID,
    ...protocol,
  })));

  const lastInstalledProtocol = orderBy(protocolsCollection, ['installationDate'], ['desc'])[0];

  if (
    lastActiveAttributes
    && lastActiveAttributes.updatedAt // Last active session exists
    && lastActiveAttributes.updatedAt > lastInstalledProtocol.installationDate
  ) {
    return {
      ...installedProtocols[lastActiveSession[entityAttributesProperty].protocolUID],
      protocolUID: lastActiveSession[entityAttributesProperty].protocolUID,
    };
  }

  return lastInstalledProtocol;
};

export const getActiveProtocolName = createSelector(
  getCurrentSessionProtocol,
  (protocol) => protocol && protocol.name,
);

export const getAssetManifest = createSelector(
  getCurrentSessionProtocol,
  (protocol) => protocol.assetManifest,
);

export const getProtocolCodebook = createSelector(
  getCurrentSessionProtocol,
  (protocol) => protocol.codebook,
);

// Get all variables for all subjects in the codebook, adding the entity and type
export const getAllVariableUUIDsByEntity = createSelector(
  getProtocolCodebook,
  ({ node: nodeTypes = {}, edge: edgeTypes = {}, ego = {} }) => {
    const variables = {};

    // Nodes
    Object.keys(nodeTypes).forEach((nodeType) => {
      const nodeVariables = get(nodeTypes, [nodeType, 'variables'], {});
      Object.keys(nodeVariables).forEach((variable) => {
        variables[variable] = {
          entity: 'node',
          entityType: nodeType,
          ...nodeVariables[variable],
        };
      });
    });

    // Edges
    Object.keys(edgeTypes).forEach((edgeType) => {
      const edgeVariables = get(edgeTypes, [edgeType, 'variables'], {});
      Object.keys(edgeVariables).forEach((variable) => {
        variables[variable] = {
          entity: 'edge',
          entityType: edgeType,
          ...edgeVariables[variable],
        };
      });
    });

    // Ego
    const egoVariables = get(ego, 'variables', {});
    Object.keys(egoVariables).forEach((variable) => {
      variables[variable] = {
        entity: 'ego',
        entityType: null,
        ...egoVariables[variable],
      };
    });

    return variables;
  },
);

const withFinishStage = (stages = []) => {
  if (!stages) { return []; }

  return [...stages, DefaultFinishStage];
};

export const getProtocolStages = createSelector(
  getCurrentSessionProtocol,
  (protocol) => withFinishStage(protocol.stages),
);
