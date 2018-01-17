import path from 'path';
import process from 'process';

const app = {
  getPath: () => path.join(process.cwd(), '__tests__', 'tmp'),
};

const electron = {
  app,
  remote: { app },
};

module.exports = electron;
