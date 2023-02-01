import { Low } from 'lowdb';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { DATABASE_PATH } from '../config/constants.js';
import CryptoAdapter from './adapter.js';

let secureDb = null;
let secureAdapter = null;
const secureDbPath = join(DATABASE_PATH, 'secureDb.json');

/**
 * Secure database
 * 
 * Stores all sensitive app data, including participant sessions. Must be
 * initialized with a password before use, and then unlocked subsequently.
 */
export const initSecureDb = async () => {
  secureAdapter = new CryptoAdapter(secureDbPath);
  secureDb = new Low(secureAdapter);
}

export function getSecureDb() {
  assert.ok(secureDb && secureAdapter, "Db has not been initialized. Please called init first.");
  return secureDb;
}

export function getSecureDbAdapter() {
  assert.ok(secureDb && secureAdapter, "Db has not been initialized. Please called init first.");
  return secureAdapter;
}