const version4 = require('./4');
const version5 = require('./5');
const version6 = require('./6');
const version7 = require('./7');
const version8 = require('./8');

/**
 * These should be in order
 */
const migrations = [
  { version: '1.0.0', migration: protocol => protocol },
  { version: 1, migration: protocol => protocol },
  { version: 2, migration: protocol => protocol },
  { version: 3, migration: protocol => protocol },
  version4,
  version5,
  version6,
  version7,
  version8,
];

module.exports = migrations;
