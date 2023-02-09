const debugLog = (...args: any[]) => {
  if (typeof process !== 'undefined' && process.env.NC_DEBUG_VALIDATOR) {
    console.log(...args); // eslint-disable-line no-console
  }
};

type ValidationArgs = {
  validate: Function,
  makeFailureMessage: Function,
}

type ValidateSingleArgs = {
  keypath: [];
  fragment: string;
  validation: ValidationArgs;
  subject: object;
}

/**
 * See addValidation().
 *
 * For readability, a keypath pattern can be supplied as a string instead of a RegExp.
 * This converts string patterns to a corresponding RegExp. Patterns will match as specifically
 * as possible, so the RegExp always matches to the end.
 *
 * - keypath patterns are separated by dots, e.g. 'protocol.forms.myForm.fields'
 * - '*' is used to denote a wildcard key in the path
 * - '[]' is used to denote an array. If a trailing '[]' is included, the keypath matches on
 *        each array element, and the validate function returns each item in turn.
 *
 * Examples:
 * - 'protocol.forms.*' is equivalent to /forms\.[^.]+$/ and will match any stage subject
 * - 'protocol.stages[].subject' is equivalent to /stages\.\[\d+\]\.subject$/ and will match
 *   a subject on any stage.
 *
 * @private
 */
const makePattern = (pattern: string | RegExp) => {
  if (typeof pattern === 'string') {
    const re = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^.]+')
      .replace(/\[\]/g, '.?\\[\\d+\\]');
    return new RegExp(`${re}$`);
  }
  return pattern;
};

// Takes a keypath array and returns a string representation with elements separated by dots.
const keypathString = (keypath: Array<string>): string =>
  keypath.reduce((acc, path) => {
    if ((/\[\d+\]/).test(path)) {
      return `${acc}${path}`;
    }
    return `${acc}.${path}`;
  });

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
class Validator {
  public errors: Array<any>;
  public warnings: Array<any>;
  public validations: Array<any>;
  public protocol: object;

  constructor(protocol: object) {
    this.errors = [];
    this.warnings = [];
    this.validations = [];
    this.protocol = protocol;
  }

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
  addValidation(pattern: string, validate: Function, makeFailureMessage: Function) {
    this.validations.push({ pattern: makePattern(pattern), validate, makeFailureMessage });
  }

  /**
   * Provides a way to run dependent validations.
   * Validations will run in sequence until the first failure.
   *
   * To always run multiple validations on the same pattern, call addValidation multiple times.
   */
  addValidationSequence(pattern: string, ...sequence: any) {
    this.validations.push({ pattern: makePattern(pattern), sequence });
  }

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

  validateSingle(keypath: [], fragment: string, validation: ValidationArgs, subject: object) {
    const { validate, makeFailureMessage } = validation;
    let result;
    try {
      result = validate(fragment, subject, keypath);
    } catch (err: any) {
      debugLog(err);
      this.warnings.push(`Validation error for ${keypathString(keypath)}: ${err.toString()}`);
      return true;
    }
    if (!result) {
      let failureMessage;
      try {
        // Try to decorate the failure message with useful info
        // const subjectTypeName = getSubjectTypeName(this.protocol.codebook, subject);
        // console.log('subjtn', subjectTypeName);
        failureMessage = makeFailureMessage(fragment, subject, keypath);
      } catch (err: any) {
        debugLog(err);
        const value = keypath.shift() || 'root';
        this.warnings.push(`makeFailureMessage error for ${value}: ${err.toString()}`);
        return true;
      }
      this.errors.push(`${keypathString(keypath)}: ${failureMessage}`);
      return false;
    }
    return true;
  }

  /**
   * Run a sequence validations in-order until a failure is hit
   * @private
   */
  validateSequence(keypath: [], fragment: string, sequence: any, subject: object) {
    sequence.every(
      (s: any) =>
        this.validateSingle(keypath, fragment, { validate: s.validate, makeFailureMessage: s.makeFailureMessage }, subject),
    );
  }

  /**
   * Run supplied validations if the validation's pattern matches the keypath
   * @private
   */
  checkFragment(keypath: [], fragment: string, subject: object) {
    this.validations.forEach(({ pattern, sequence, validate, makeFailureMessage }) => {
      if (!pattern.test(keypathString(keypath))) {
        return;
      }
      if (sequence) {
        this.validateSequence(keypath, fragment, sequence, subject);
      } else {
        this.validateSingle(keypath, fragment, { validate, makeFailureMessage }, subject);
      }
    });
  }

  /**
   * Run all validations that have been added for this protocol.
   *
   * When done,
   * - `validator.errors` will contain all errors uncovered.
   * - `validator.warnings` will contain other warnings, including any errors with validation
   * itself (which should not prevent a protocol from validating).
   */
  runValidations() {
    this.traverse(this.protocol);
  }

  /**
   * Recursively traverse to validate parts of a protocol for which we have validations
   * @private
   */
  traverse(fragment: any, keypath: any = ['protocol'], subject = null) {
    if (!fragment) {
      debugLog('-', keypathString(keypath));
      return;
    }

    const stageSubject = subject || fragment.subject;

    this.checkFragment(keypath, fragment, stageSubject);

    if (Array.isArray(fragment)) {
      fragment.forEach((v, i) => {
        this.traverse(v, [...keypath, `[${i}]`], stageSubject);
      });
    } else if (fragment && typeof fragment === 'object') {
      Object.entries(fragment).forEach(([key, val]) => {
        this.traverse(val, [...keypath, key], stageSubject);
      });
    } else { // Leaf node
      debugLog('-', keypathString(keypath));
    }
  }
}

export default Validator;
