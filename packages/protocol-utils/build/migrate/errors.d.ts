export class MigrationNotPossibleError extends Error {
    constructor(from?: undefined, to?: undefined, ...params: any[]);
}
export class VersionMismatchError extends Error {
    constructor(from?: undefined, to?: undefined, ...params: any[]);
}
export class MigrationStepError extends Error {
    constructor(version?: undefined, ...params: any[]);
}
export class StringVersionError extends Error {
    constructor(version?: undefined, type?: undefined, ...params: any[]);
}
declare namespace _default {
    export { VersionMismatchError };
    export { MigrationNotPossibleError };
    export { MigrationStepError };
    export { StringVersionError };
}
export default _default;
//# sourceMappingURL=errors.d.ts.map