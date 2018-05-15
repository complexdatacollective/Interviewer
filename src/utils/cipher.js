/**
 * Copied verbatim from Server! TODO: shared submodule.
 */

const libsodium = require('libsodium-wrappers');

/**
 * Crypto-related helpers for client/sever pairing and messaging.
 *
 * In general, public interfaces work with raw byte arrays (`[Uint8Array]`), serialized
 * (hexadecimal-encoded) strings of those arrays, or plaintext, depending on the expected/common
 * use case. Functions returning a byte array are suffixed with 'Bytes'.
 * See function documentation for specifics.
 *
 * @namespace cipher
 */

/**
 * Create a new salt, to be used for secret derivation.
 *
 * @memberOf cipher
 * @return {Uint8Array} byte array
 */
const newSaltBytes = () => libsodium.randombytes_buf(libsodium.crypto_pwhash_SALTBYTES);

/**
 * Convert raw bytes -> hex.
 * Stricter than libsodium.to_hex to prevent accidental misuse.
 *
 * @memberOf cipher
 * @param  {Uint8Array} byteArray
 * @return {string}
 * @throws {TypeError} If input isn't a byte array
 */
const toHex = (byteArray) => {
  if (!(byteArray instanceof Uint8Array)) {
    throw new TypeError('toHex must called on a byteArray');
  }
  return libsodium.to_hex(byteArray);
};

/**
 * Convert hex -> raw bytes.
 * This is not a direct assignment, since libsodium initializes asynchronously.
 *
 * @memberOf cipher
 * @param  {string} hex-encoded string
 * @return {Uint8Array} byte array
 * @throws {Error} If input can't be converted
 */
const fromHex = hex => libsodium.from_hex(hex);

/**
 * Key derivation from the out-of-band passcode and server-generated salt (byte array).
 *
 * @memberOf cipher
 * @param  {string} pairingCode read by user from GUI and entered into a client device
 * @param  {Uint8Array} salt
 * @return {Uint8Array} raw bytes of the secret key
 * @throws {RangeError|TypeError} If input invalid
 */
const deriveSecretKeyBytes = (pairingCode, salt) => {
  if (!pairingCode) {
    throw new TypeError('pairingCode is required');
  }
  if (!salt || !(salt instanceof Uint8Array)) {
    throw new TypeError('salt must be a Uint8Array');
  }
  if (salt.length !== libsodium.crypto_pwhash_SALTBYTES) {
    throw new RangeError(`salt must be ${libsodium.crypto_pwhash_SALTBYTES} bytes`);
  }

  // Parameters for secret key Derivation. Client and server configurations *must match*.
  // TODO: These could be stored per-device to support changing or configurable values in the future
  // The mem limit is lower than MEM_LIMIT_INTERACTIVE because of supported environments, but should
  // suffice (passcodes are single-use).
  const DerivationMemLimit = 2 ** 23;
  const DerivationOpsLimit = libsodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
  const DerivationAlgo = libsodium.crypto_pwhash_ALG_ARGON2ID13;
  const DerivedKeyLength = libsodium.crypto_box_SECRETKEYBYTES;

  return libsodium.crypto_pwhash(
    DerivedKeyLength,
    pairingCode,
    salt,
    DerivationOpsLimit,
    DerivationMemLimit,
    DerivationAlgo,
  );
};

/**
 * The inverse of encryptedBytes. See {@link decipher} for common interface.
 *
 * @memberOf cipher
 * @private
 * @param  {Uint8Array} noncePlusCipher
 * @param  {Uint8Array} secretBytes a nonce, prepended to the encrypted byte array
 * @return {Uint8Array}
 * @throws {Error} If decryption fails for any reason
 */
const decryptedBytes = (noncePlusCipher, secretKey) => {
  if (!libsodium.crypto_secretbox_open_easy) {
    throw new Error('decryptedBytes cannot be called before libsodium.ready');
  }

  // Message must contain nonce + MAC.
  const minLength = libsodium.crypto_secretbox_NONCEBYTES + libsodium.crypto_secretbox_MACBYTES;
  if (noncePlusCipher.length < minLength) {
    throw new Error('Message too short');
  }

  const receivedNonce = noncePlusCipher.slice(0, libsodium.crypto_secretbox_NONCEBYTES);
  const receivedCipher = noncePlusCipher.slice(libsodium.crypto_secretbox_NONCEBYTES);
  return libsodium.crypto_secretbox_open_easy(receivedCipher, receivedNonce, secretKey);
};

/**
 * Deciphers a message with the secret key. Handles the common case, where both inputs are available
 * as hex strings (from an API request and database load, respectively).
 *
 * @memberOf cipher
 * @param  {string} messageHex hexadecimal representation of encrypted message bytes
 * @param  {string} secretHex hexadecimal representation of shared secret
 * @return {string} decrypted message
 * @throws {Error} If decryption fails for any reason
 */
const decrypt = (messageHex, secretHex) => {
  if (!messageHex || !secretHex) {
    throw new Error('plaintext and secretHex are required');
  }
  const messageBytes = fromHex(messageHex);
  const secretBytes = fromHex(secretHex);
  return libsodium.to_string(decryptedBytes(messageBytes, secretBytes));
};

/**
 * Encrypt a message, suitable for authenticated encryption with secretbox.
 * The returned byte array includes a fixed-length, plaintext nonce prepended to the cipher.
 * @{link decrypt} uses the nonce as part of the decryption step.
 *
 * @memberOf cipher
 * @private
 * @param  {Uint8Array} message
 * @param  {Uint8Array} secretKey raw bytes comprising the shared secret key
 * @return {Uint8Array} Nonce (fixed-length) + Cipher data
 * @throws {Error} If inputs are invalid
 */
const encryptedBytes = (message, secretKey) => {
  if (!libsodium.crypto_secretbox_easy) {
    throw new Error('encryptedBytes cannot be called before libsodium.ready');
  }
  if (!message || !secretKey) {
    throw new Error('message and secret are required');
  }
  if (secretKey.length !== libsodium.crypto_secretbox_KEYBYTES) {
    throw new RangeError(`secret must be ${libsodium.crypto_secretbox_KEYBYTES} bytes`);
  }

  const nonceBytes = libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES);
  const cipherBytes = libsodium.crypto_secretbox_easy(message, nonceBytes, secretKey);
  const noncePlusCipher = new Uint8Array(nonceBytes.length + cipherBytes.length);
  noncePlusCipher.set(nonceBytes);
  noncePlusCipher.set(cipherBytes, nonceBytes.length);

  return noncePlusCipher;
};

/**
 * Encipher a plaintext message with the given secret.
 *
 * @memberOf cipher
 * @param  {string} plaintext [description]
 * @param  {string} secretHex [description]
 * @return {string} hexadecimal-encoded encrypted message
 * @throws {Error} If inputs are invalid
 */
const encrypt = (plaintext, secretHex) => {
  if (!plaintext || !secretHex) {
    throw new Error('plaintext and secretHex are required');
  }
  const secretBytes = fromHex(secretHex);
  const message = libsodium.from_string(plaintext);
  return toHex(encryptedBytes(message, secretBytes));
};

module.exports = {
  decrypt,
  deriveSecretKeyBytes,
  encrypt,
  fromHex,
  newSaltBytes,
  toHex,
};
