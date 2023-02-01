import { getSecureDb, getSecureDbAdapter } from "../storage/secure.js";

export const initController = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).send({ error: 'Password is required' });
    return;
  }

  const secureAdapter = getSecureDbAdapter();

  if (secureAdapter.initialized) {
    console.warn("Database already initialized - overwriting!");
  }

  console.log('Initializing secure database');

  try {
    await secureAdapter.setPassword(password);
  } catch (e) {
    console.log('Error initializing database: ', e);
    res.status(401).send({ error: 'Incorrect password' });
    return;
  }

  const secureDb = getSecureDb()

  await secureDb.read(); // This populates secureDB.data
  console.log('data: ', secureDb.data)
  console.log('Database initialized');
  res.send({ success: true });
};

export const unlockController = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).send({ error: 'Password is required' });
    return;
  }

  const secureAdapter = getSecureDbAdapter();

  if (!secureAdapter.isLocked) {
    console.warn("Database already unlocked!");
    return;
  }

  console.log('Unlocking secure database');
  try {
    await secureAdapter.unlock(password);
  } catch (e) {
    res.status(401).send({ error: 'Incorrect password' });
    return;
  }

  const secureDb = getSecureDb()

  await secureDb.read(); // This populates secureDB.data
  console.log('Database unlocked');
  console.log(secureDb, secureDb.data);
  res.send({ success: true });
};