module.exports = {
  setupTestFrameworkScriptFile: '<rootDir>/setup.js',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(\@codaco\/ui)/)',
  ],
  bail: true,
};
