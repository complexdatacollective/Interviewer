export default migrations;
/**
 * These must be in order!
 */
declare const migrations: ({
    version: number;
    notes: string;
    migration: (protocol: any) => any;
} | {
    version: string;
    migration: (protocol: any) => any;
} | {
    version: number;
    migration: (protocol: any) => any;
})[];
//# sourceMappingURL=index.d.ts.map