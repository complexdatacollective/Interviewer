/* eslint-disable */

/*
 * To enable this image reporter, add it to your `jest.config.js` "reporters" definition:
    "reporters": [ "default", "<rootDir>/image-reporter.js" ]
 */

const _chalk = require('chalk');
const fs = require('node:fs');
const path = require('node:path');
const imgbbUploader = require('imgbb-uploader');

const IMGBB_API_KEY = process.env.IMGBB_TOKEN;

class ImageReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onTestResult(_test, testResult, _aggregateResults) {
    if (
      testResult.numFailingTests &&
      testResult.failureMessage.match(/different from snapshot/)
    ) {
      const imagePath = path.resolve(
        process.cwd(),
        'integration-tests/__tests__/__image_snapshots__/__diff_output__/',
      );
      const files = fs.readdirSync(imagePath);
      files.forEach((value) => {
        imgbbUploader(IMGBB_API_KEY, path.resolve(imagePath, value))
          .then((_response) => {})
          .catch((_error) => {});
      });
    }
  }
}

module.exports = ImageReporter;
