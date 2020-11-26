#!/usr/bin/env node

// Save hook under `project-root/hooks/before_prepare/`
//
// Don't forget to install xml2js using npm
// `$ npm install xml2js`

const fs = require('fs');
const xml2js = require('xml2js');

module.exports = function(ctx) {
  return new Promise((resolve, reject) => {
    fs.readFile('config.xml', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      // Get XML
      const xml = data;

      // Parse XML to JS Obj
      xml2js.parseString(xml, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        // Get JS Obj
        const obj = result;

        // ios-CFBundleVersion doen't exist in config.xml
        if (typeof obj['widget']['$']['ios-CFBundleVersion'] === 'undefined') {
          obj['widget']['$']['ios-CFBundleVersion'] = 0;
        }

        // android-versionCode doen't exist in config.xml
        if(typeof obj['widget']['$']['android-versionCode'] === 'undefined') {
          obj['widget']['$']['android-versionCode'] = 0;
        }

        // Increment build numbers (separately for iOS and Android)
        obj['widget']['$']['ios-CFBundleVersion']++;
        obj['widget']['$']['android-versionCode']++;

        // Build XML from JS Obj
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(obj);

        // Write config.xml
        fs.writeFile('config.xml', xml, (err) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          console.log('Build number incremented!');
          resolve();
        });
      });
    });
  });
};
