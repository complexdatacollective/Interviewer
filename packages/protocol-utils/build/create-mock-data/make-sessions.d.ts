import { protocolProperty, NcNetwork, Protocol } from '@codaco/shared-consts';
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
export declare const makeSession: (protocol: Protocol) => NcSession;
export declare const makeSessions: (protocol: Protocol, sessionCount: number) => NcSession[];
export default makeSessions;
//# sourceMappingURL=make-sessions.d.ts.map