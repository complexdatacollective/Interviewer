const isRequired = (param) => { throw new Error(`${param} is required`); };

const assetUrl = (
  protocolName = isRequired('protocolName'),
  assetPath = isRequired('assetPath'),
) =>
  `asset://${protocolName}/assets/${assetPath}`;

export default assetUrl;
