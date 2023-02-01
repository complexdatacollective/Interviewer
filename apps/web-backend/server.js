import express from 'express';
import { BACKEND_PORT } from './config/constants.js';
import { getSecureDbAdapter, initSecureDb } from './storage/secure.js';
import { initInstanceDb } from './storage/instance.js';
import apiRouter from './routes/api.js';
import databaseRouter from './routes/database.js';

// Initialize secureDB
await initSecureDb();
await initInstanceDb();

// When in development mode, set a password for the database and/or unlock it on startup.
// This is just for convenience, so you don't have to unlock the database every time you restart the server.
// In production, you should not do this, and instead use the API to initialize and unlock the database.
if (process.env.NODE_ENV === 'development') {
  const secureAdapter = getSecureDbAdapter();

  if (!secureAdapter.initialized) {
    await secureAdapter.setPassword('password');
  } else if (secureAdapter.isLocked) {
    await secureAdapter.unlock('password');
  }
}


// Configure express
const app = express();
app.use(express.json()); // support json encoded bodies, needed por post x-www-form-urlencoded to work
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use('/', express.static('frontend')); // Interviewer frontend

app.use(databaseRouter);
app.use(apiRouter);

app.listen(BACKEND_PORT, () => { console.log(`Fresco running on port ${BACKEND_PORT}`); }); // Start server
