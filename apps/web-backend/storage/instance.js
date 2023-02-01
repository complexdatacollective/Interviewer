import { Low } from 'lowdb';
import { join } from 'node:path';
import { JSONFile } from 'lowdb/node';
import assert from 'node:assert/strict';
import instanceDbSeedData from '../config/seed/instanceDB-seed.json' assert { type: 'json' };
import { DATABASE_PATH } from '../config/constants.js';

let instanceDb = null;
let instanceAdapter = null;
const instanceDbPath = join(DATABASE_PATH, 'instanceDb.json');

/**
 * Instance database
 * 
 * Stores all non-sensitive app data related to the instance. Does not
 * require a password to be initialized or unlocked.
 */
export const initInstanceDb = async () => {
  instanceAdapter = new JSONFile(instanceDbPath);
  instanceDb = new Low(instanceAdapter);

  // Initialize instanceDB with default data
  await instanceDb.read();
  instanceDb.data = instanceDb.data || instanceDbSeedData;
  await instanceDb.write();
}

export function getInstanceDb() {
  assert.ok(instanceDb && instanceAdapter, "Db has not been initialized. Please called init first.");
  return instanceDb;
}

export function getInstanceDbAdapter() {
  assert.ok(instanceDb && instanceAdapter, "Db has not been initialized. Please called init first.");
  return instanceAdapter;
}