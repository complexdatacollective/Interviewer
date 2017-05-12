import createLogger from 'redux-logger';

const logger = createLogger({
  level: 'info',
  collapsed: false,
  logger: console,
});

export default logger;
