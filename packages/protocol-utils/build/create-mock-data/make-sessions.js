import { caseProperty, protocolProperty } from '@codaco/shared-consts';
import { v4 as uuid } from 'uuid';
import { makeNetwork } from './make-network.js';
export const makeSession = (protocol) => {
    const network = makeNetwork(protocol);
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
export const makeSessions = (protocol, sessionCount) => Array.from({ length: sessionCount }).map(() => makeSession(protocol));
export default makeSessions;
//# sourceMappingURL=make-sessions.js.map