import createLogger from 'redux-logger';

const logger = createLogger({
  level: 'info',
  collapsed: true,
  logger: console,
});

export default logger;
