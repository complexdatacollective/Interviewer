import { APP_SUPPORTED_SCHEMA_VERSIONS } from "~/config.js";
import { PROTOCOL_EXTENSION } from "../../../../config";

export const checkSchemaVersion = (protocol) => {
  if (APP_SUPPORTED_SCHEMA_VERSIONS.includes(protocol.schemaVersion)) {
    return Promise.resolve(protocol);
  }

  return Promise.reject(new Error('The schema version of this protocol is not compatible with this version of Network Canvas Interviewer. Upgrade the protocol using Architect, and try importing it again.'));
}

export const filenameFromURI = uri =>
  decodeURIComponent(uri.split('/').pop().split('#')[0].split('?')[0]);

export const filenameFromPath = path => path.split(/.*[/|\\]/)[1];

export const protocolNameFromFilename = filename => filename.slice(0, -PROTOCOL_EXTENSION.length);
