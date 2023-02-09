import validateSchema from "./validateSchema.js";
import validateLogic from "./validateLogic.js";
export class ValidationError extends Error {
    constructor(message, schemaErrors, dataErrors) {
        super(message); // (1)
        this.schemaErrors = schemaErrors;
        this.dataErrors = dataErrors;
        this.name = "ValidationError"; // (2)
        this.schemaErrors = [];
        this.dataErrors = [];
    }
}
const validateProtocol = (jsonString, forceVersion) => {
    let data;
    try {
        data = JSON.parse(jsonString);
    }
    catch (e) {
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
