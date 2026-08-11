import { validateProtocol as runProtocolValidation } from '@codaco/protocol-validation';

import { APP_SUPPORTED_SCHEMA_VERSIONS } from '../../config';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import { readFile } from '../filesystem';
import protocolPath from './protocolPath';

const openError = friendlyErrorMessage(
  "There was an error reading that protocol file. It doesn't seem to be a valid JSON object. Check the format of your protocol, and try again.",
);
const validationError = friendlyErrorMessage(
  'Your protocol file failed validation. See below for the specific problems we found. This is often caused by attempting to open a protocol file authored in an incompatible version of Architect.',
);

// Basic validation on protocol format;
// any error will halt loading and display a message to the user.
const validateProtocol = async (protocol) => {
  const { isValid, schemaErrors, logicErrors } =
    await runProtocolValidation(protocol);

  if (!isValid) {
    const message = [...schemaErrors, ...logicErrors]
      .map(({ path, message: errorMessage }) => `${path}: ${errorMessage}`)
      .join('\n');
    return Promise.reject(new Error(message));
  }

  return protocol;
};

const checkSchemaVersion = (protocol) => {
  if (APP_SUPPORTED_SCHEMA_VERSIONS.includes(protocol.schemaVersion)) {
    return Promise.resolve(protocol);
  }

  return Promise.reject(
    new Error(
      'The schema version of this protocol is not compatible with this version of Network Canvas Interviewer Classic. Upgrade the protocol using Architect, and try importing it again.',
    ),
  );
};

const parseProtocol = (protocolUID, name) =>
  protocolPath(protocolUID, 'protocol.json')
    .then((filePath) => readFile(filePath))
    .then((json) => JSON.parse(json))
    .then((protocol) => checkSchemaVersion(protocol))
    .then((protocol) => validateProtocol(protocol))
    .catch(validationError)
    .then((protocol) => {
      const withFilename = {
        ...protocol,
        name,
        uid: protocolUID,
      };
      return withFilename;
    })
    .catch(openError);

export default parseProtocol;
