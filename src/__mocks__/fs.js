/* eslint-env jest */

const rfs = require.requireActual('fs');

const fs = jest.genMockFromModule('fs');

fs.readFileSync = rfs.readFileSync;

module.exports = fs;
