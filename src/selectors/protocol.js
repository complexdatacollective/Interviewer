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

export const getActiveProtocol = createSelector(
  (state, props) => getActiveSession(state, props),
  getInstalledProtocols,
  (session, protocols) => {
    if (!session) {
      return {};
    }
    return protocols[session.protocolUID];
  },
);

export const getAssetManifest = createSelector(
  getActiveProtocol,
  protocol => protocol.assetManifest,
);


export const getProtocolCodebook = createSelector(
  getActiveProtocol,
  protocol => protocol.codebook,
);

export const getRemoteProtocolId = createDeepEqualSelector(
  getActiveProtocol,
  protocol => nameDigest(protocol.name) || null,
);

const withFinishStage = (stages = []) => {
  if (!stages) { return []; }
  if (isPreview()) { return stages; }

  return [...stages, DefaultFinishStage];
};

export const getProtocolStages = createSelector(
  getActiveProtocol,
  protocol => withFinishStage(protocol.stages),
);
