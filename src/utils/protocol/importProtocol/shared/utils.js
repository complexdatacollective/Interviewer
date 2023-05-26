import { APP_SUPPORTED_SCHEMA_VERSIONS } from "~/config.js";

export const checkSchemaVersion = (protocol) => {
  if (APP_SUPPORTED_SCHEMA_VERSIONS.includes(protocol.schemaVersion)) {
    return Promise.resolve(protocol);
  }

  return Promise.reject(new Error('The schema version of this protocol is not compatible with this version of Network Canvas Interviewer. Upgrade the protocol using Architect, and try importing it again.'));
}
