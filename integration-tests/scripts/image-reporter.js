/* eslint-disable */

/*
 * To enable this image reporter, add it to your `jest.config.js` "reporters" definition:
    "reporters": [ "default", "<rootDir>/image-reporter.js" ]
 */

const chalk = require('chalk');
const fs = require('fs');
const imgbbUploader = require('imgbb-uploader');

const IMGBB_API_KEY = process.env.IMGBB_TOKEN;

class ImageReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onTestResult(test, testResult, aggregateResults) {
    if (testResult.numFailingTests && testResult.failureMessage.match(/different from snapshot/)) {
      const files = fs.readdirSync(`${process.env.rootDir}/__tests__/__image_snapshots__/__diff_output__/`);
      files.forEach((value) => {
        console.log('value', value);
        imgbbUploader(IMGBB_API_KEY, `${process.env.rootDir}/__tests__/__image_snapshots__/__diff_output__/${value}`)
          .then(response => {
            console.log(chalk.red.bold(`Uploaded image diff file to ${response.url}`));
          })
          .catch(error => console.log(error, error.stack))
      });
    }
  }
}

module.exports = ImageReporter;
