const checkSupport = (protocol, supportedVersions) => {
  if (supportedVersions && !supportedVersions.includes(protocol.schemaVersion)) {
    throw new Error(`Protocol schema version ${JSON.stringify(protocol.schemaVersion)} does not match any supported by application: ${JSON.stringify(supportedVersions)}`);
  }

  return true;
};

module.exports = checkSupport;
