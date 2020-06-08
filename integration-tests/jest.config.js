module.exports = {
  setupFilesAfterEnv: ['./setup.js'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(\@codaco\/ui)/)',
  ],
  bail: true,
  reporters: ['default', './scripts/image-reporter.js'],
};
