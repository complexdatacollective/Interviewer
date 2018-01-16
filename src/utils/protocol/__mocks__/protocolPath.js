/* eslint-env jest */

const protocolPath = jest.fn((...args) => `tmp/fake/path/${args.join('/')}`);

export default protocolPath;
