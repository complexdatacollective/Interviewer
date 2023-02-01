const createLogger = () => () => next => action =>
  next(action);

export default createLogger;
