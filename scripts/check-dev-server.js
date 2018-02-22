'use strict';

const fs = require('fs');
const paths = require('../config/paths');
const chalk = require('chalk');

if (!fs.existsSync(paths.dotdevserver)) {
  console.warn(chalk.yellow(`Warning: ${paths.dotdevserver} does not exist. Run 'npm start' first?`));
}
