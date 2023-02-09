import validateSchema from "./validateSchema.js";
import validateLogic from "./validateLogic.js";

type ValidateProtocolReturn = boolean | ValidationError;

export class ValidationError extends Error {
  constructor(message: string, public schemaErrors: Array<string>, public dataErrors: Array<string>) {
    super(message); // (1)
    this.name = "ValidationError"; // (2)
    this.schemaErrors = [];
    this.dataErrors = [];
  }
}

const validateProtocol = (jsonString: string, forceVersion: string): ValidateProtocolReturn => {
  let data;

  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    console.error(e);
    throw new Error('Invalid JSON file');
  }

  const schemaErrors = validateSchema(data, forceVersion);
  const dataErrors = validateLogic(data);
  const isValid = !schemaErrors.length && !dataErrors.length;

  if (isValid) {
    return true;
  }

  throw new ValidationError('Invalid protocol', schemaErrors, dataErrors);
};

export default validateProtocol;