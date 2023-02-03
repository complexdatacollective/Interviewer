/* eslint-env jest */

const rfs = jest.requireActual('fs');

const fs = jest.genMockFromModule('fs');

fs.readFileSync = rfs.readFileSync;

module.exports = fs;
