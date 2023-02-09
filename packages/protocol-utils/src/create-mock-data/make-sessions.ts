import { caseProperty, protocolProperty, NcNetwork, Protocol } from '@codaco/shared-consts';
import { v4 as uuid } from 'uuid';
import { makeNetwork } from './make-network.js';

// These keys should be in @codaco/shared-consts
export type NcSession = {
  [protocolProperty]: string;
  promptIndex: number;
  stageIndex: number;
  caseId: string;
  network: NcNetwork;
  startedAt: number;
  updatedAt: number;
  finishedAt: number;
  exportedAt: number;
};

export const makeSession = (protocol: Protocol): NcSession => {
  const network: NcNetwork = makeNetwork(protocol);

  return {
    [protocolProperty]: uuid(),
    promptIndex: 0,
    stageIndex: 0,
    [caseProperty]: 'mock',
    network,
    startedAt: 0,
    updatedAt: 0,
    finishedAt: 0,
    exportedAt: 0,
  };
};

export const makeSessions = (
  protocol: Protocol,
  sessionCount: number,
): NcSession[] => Array.from({ length: sessionCount }).map(() => makeSession(protocol));

export default makeSessions;
