import crypto from 'crypto';
import uuid from 'uuid/v4';
import { createSelector } from 'reselect';
import { createDeepEqualSelector } from './utils';
import { isPreview } from '../utils/Environment';
import { getActiveSession } from './session';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuid(),
  type: 'FinishSession',
  label: 'Finish Interview',
};


/**
 * The remote protocol ID on any instance of Server is the hex-encoded sha256 of its [unique] name.
 * Server will need to know this ID when we export/import session data.
 */
const nameDigest = name => name && crypto.createHash('sha256').update(name).digest('hex');

export const getInstalledProtocols = state => state.installedProtocols;

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

export const getActiveProtocolName = createSelector(
  getActiveProtocol,
  protocol => protocol && protocol.name,
);

export const getAssetManifest = createSelector(
  getCurrentSessionProtocol,
  protocol => protocol.assetManifest,
);


export const getProtocolCodebook = createSelector(
  getCurrentSessionProtocol,
  protocol => protocol.codebook,
);

export const getRemoteProtocolId = createDeepEqualSelector(
  getCurrentSessionProtocol,
  protocol => nameDigest(protocol.name) || null,
);

const withFinishStage = (stages = []) => {
  if (!stages) { return []; }
  if (isPreview()) { return stages; }

  return [...stages, DefaultFinishStage];
};

export const getProtocolStages = createSelector(
  getCurrentSessionProtocol,
  protocol => withFinishStage(protocol.stages),
);
