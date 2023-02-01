import { readFile, writeFile, open } from "node:fs/promises";
import { createHash, randomBytes, createDecipheriv, createCipheriv } from "node:crypto";
import secureDBSeed from '../config/seed/secureDB-seed.json' assert { type: 'json' };

class CryptoAdapter {
  constructor(file) {
    this.file = file;
    this.password = null;
    this.isLocked = false;
    this.initialized = false;
    console.log('New CryptoAdapter created', file);
  }

  #getCipherKey() {
    return createHash('sha256').update(this.password).digest();
  }

  encrypt(data) {
    const IV = randomBytes(16);
    let cipher = createCipheriv('aes-256-cbc', Buffer.from(this.#getCipherKey()), IV);
    let encrypted = cipher.update(data);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const result = IV.toString('hex') + ':' + encrypted.toString('hex');

    return result;
  }

  decrypt(data) {
    let parts = data.split(':');
    let IV = Buffer.from(parts.shift(), 'hex');
    let encryptedText = Buffer.from(parts.join(':'), 'hex');
    let decipher = createDecipheriv('aes-256-cbc', Buffer.from(this.#getCipherKey()), IV);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  testConnection = async () => {
    // If the file doesn't exist, create it by encrypting an empty object
    await open(this.file, 'r').catch(async () => {
      await writeFile(this.file, this.encrypt(JSON.stringify({}), this.password));
      this.isLocked = false;
      return true;
    });

    const encryptedFile = await readFile(file, "UTF-8");

    try {
      JSON.parse(decrypt(encryptedFile, this.password));
      this.isLocked = false;
      return true;
    } catch (error) {
      error.message = "Unsuccessful  attempt to connect to the database. Error: \n" + error.message;
      throw error;
    }
  }

  async write(data) {
    if (this.isLocked) {
      throw new Error("Database is locked");
    }

    const encryptedData = this.encrypt(JSON.stringify(data), this.password)
    return writeFile(this.file, encryptedData);
  }

  async read() {
    if (this.isLocked) {
      throw new Error("Database is locked");
    }

    const encryptedData = await readFile(this.file, "UTF-8");
    const decryptedData = this.decrypt(encryptedData, this.password);
    return JSON.parse(decryptedData);
  }

  // This is called when the database is first created
  setPassword = async (password) => {
    this.password = password;

    this.write(secureDBSeed);
    // Overwrite the file with an empty object
    this.initialized = true;
  }

  unlock = async (password) => {
    if (!this.isLocked) {
      throw new Error("Database is already unlocked");
    }

    this.password = password;
    return this.testConnection();
  }
}

export default CryptoAdapter;
