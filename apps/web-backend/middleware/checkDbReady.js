import { getSecureDbAdapter } from "../storage/secure.js";

// Express middleware to check that the database is unlocked
const checkDBReady = (req, res, next) => {
  const secureDbAdapter = getSecureDbAdapter();
  if (secureDbAdapter.initialized && !secureDbAdapter.isLocked) {
    next();
  } else {
    res.status(401).send({ error: 'Database is locked or not initialized.' });
  }
};

export default checkDBReady;
