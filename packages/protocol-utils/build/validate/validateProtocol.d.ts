type ValidateProtocolReturn = boolean | ValidationError;
export declare class ValidationError extends Error {
    schemaErrors: Array<string>;
    dataErrors: Array<string>;
    constructor(message: string, schemaErrors: Array<string>, dataErrors: Array<string>);
}
declare const validateProtocol: (jsonString: string, forceVersion: string) => ValidateProtocolReturn;
export default validateProtocol;
//# sourceMappingURL=validateProtocol.d.ts.map