/* eslint-env jest */

const protocolPath = jest.fn((...args) => `tmp/mock/path/protocols/${args.join('/')}`);

export default protocolPath;
