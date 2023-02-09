type ValidationArgs = {
    validate: Function;
    makeFailureMessage: Function;
};
/**
 * @class
 * Support data validations on a protocol.
 *
 * When runValidations() is called on an instance, we walk the entire protocol,
 * keeping track of the keypath.
 *
 * When a keypath matches one (or more) of the supplied validation patterns,
 * the corresponding validation function is called.
 *
 * Validations are added with `addValidation()` or `addValidationSequence()`.
 */
declare class Validator {
    errors: Array<any>;
    warnings: Array<any>;
    validations: Array<any>;
    protocol: object;
    constructor(protocol: object);
    /**
     * @description Run the given validation for any protocol fragment matching the pattern
     * @param {string|RegExp} pattern
     * @param {Function} validate called to validate a fragment when pattern matches
     *                            `validate(fragment) => boolean`
     *                            Return true if validation passes; false if there was a failure.
     * @param {Function} makeFailureMessage called with the fragment when validation fails.
     *                                      `makeFailureMessage(fragment) => string`
     *                                      Return a user-facing error message.
     */
    addValidation(pattern: string, validate: Function, makeFailureMessage: Function): void;
    /**
     * Provides a way to run dependent validations.
     * Validations will run in sequence until the first failure.
     *
     * To always run multiple validations on the same pattern, call addValidation multiple times.
     */
    addValidationSequence(pattern: string, ...sequence: any): void;
    /**
     * Run the added validation on the given fragment identified by keypath
     * @private
     * @param  {Array} keypath
     * @param  {Any} fragment
     * @param  {Function} validation.validate
     * @param  {Function} validation.makeFailureMessage
     * @param  {Object} subject the entity & type (for stage fragments & descendants)
     * @return {boolean} result false if there was an error,
     *                          true if validation passed, or if validation couldn't be completed
     */
    validateSingle(keypath: [], fragment: string, validation: ValidationArgs, subject: object): boolean;
    /**
     * Run a sequence validations in-order until a failure is hit
     * @private
     */
    validateSequence(keypath: [], fragment: string, sequence: any, subject: object): void;
    /**
     * Run supplied validations if the validation's pattern matches the keypath
     * @private
     */
    checkFragment(keypath: [], fragment: string, subject: object): void;
    /**
     * Run all validations that have been added for this protocol.
     *
     * When done,
     * - `validator.errors` will contain all errors uncovered.
     * - `validator.warnings` will contain other warnings, including any errors with validation
     * itself (which should not prevent a protocol from validating).
     */
    runValidations(): void;
    /**
     * Recursively traverse to validate parts of a protocol for which we have validations
     * @private
     */
    traverse(fragment: any, keypath?: any, subject?: null): void;
}
export default Validator;
//# sourceMappingURL=Validator.d.ts.map