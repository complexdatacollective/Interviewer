/**
 * Copied verbatim from Server! TODO: shared submodule.
 */

const libsodium = require('libsodium-wrappers');

/**
 * Create a new salt, to be used for secret derivation
 * @return {Uint8Array} byte array
 */
const newSaltBytes = () => libsodium.randombytes_buf(libsodium.crypto_pwhash_SALTBYTES);

/**
 * Convert raw bytes -> hex.
 * Stricter than libsodium.to_hex to prevent accidental misuse.
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
 * @param  {string} hex-encoded string
 * @return {Uint8Array} byte array
 * @throws {Error} If input can't be converted
 */
const fromHex = hex => libsodium.from_hex(hex);

/**
 * Key derivation from the out-of-band passcode and server-generated salt.
 * @param  {string} pairingCode read by user from GUI and entered into a client device
 * @param  {Uint8Array} salt
 * @return {Uint8Array} raw bytes of the secret key
 * @throws {RangeError|TypeError} If input invalid
 */
const deriveSecretKeyBytes = (pairingCode, saltBytes) => {
  if (!pairingCode) {
    throw new TypeError('pairingCode is required');
  }
  if (!saltBytes || !(saltBytes instanceof Uint8Array)) {
    throw new TypeError('saltBytes must be a Uint8Array');
  }
  if (saltBytes.length !== libsodium.crypto_pwhash_SALTBYTES) {
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
    saltBytes,
    DerivationOpsLimit,
    DerivationMemLimit,
    DerivationAlgo,
  );
};

/**
 * The inverse of encryptedBytes. See {@link decipher} for common interface.
 * @private
 * @param  {Uint8Array} messageBytes
 * @param  {Uint8Array} secretBytes
 * @return {Uint8Array}
 * @throws {Error} If decryption fails for any reason
 */
const decryptedBytes = (messageBytes, secretBytes) => {
  if (!libsodium.crypto_secretbox_open_easy) {
    throw new Error('decryptedBytes cannot be called before libsodium.ready');
  }

  // Message must contain nonce + MAC.
  const minLength = libsodium.crypto_secretbox_NONCEBYTES + libsodium.crypto_secretbox_MACBYTES;
  if (messageBytes.length < minLength) {
    throw new Error('Message too short');
  }

  const receivedNonce = messageBytes.slice(0, libsodium.crypto_secretbox_NONCEBYTES);
  const receivedCipher = messageBytes.slice(libsodium.crypto_secretbox_NONCEBYTES);
  return libsodium.crypto_secretbox_open_easy(receivedCipher, receivedNonce, secretBytes);
};

/**
 * Deciphers a message with the secret key. Handles the common case, where both inputs are available
 * as hex strings (from an API request and database load, respectively).
 * @param  {string} messageHex hexadecimal representation of encrypted message bytes
 * @param  {string} secretHex hexadecimal representation of shared secret
 * @return {string} decrypted message
 * @throws {Error} If decryption fails for any reason
 */
const decrypt = (messageHex, secretHex) => {
  const messageBytes = fromHex(messageHex);
  const secretBytes = fromHex(secretHex);
  return libsodium.to_string(decryptedBytes(messageBytes, secretBytes));
};

/**
 * Encrypt a plaintext message, suitable for authenticated encryption with secretbox.
 * The returned byte array includes a fixed-length, plaintext nonce prepended to the cipher.
 * @{link decrypt} uses the nonce as part of the decryption step.
 *
 * @param  {string} plaintext   [description]
 * @param  {Uint8Array} secretBytes raw bytes comprising the shared secret key
 * @return {Uint8Array} Nonce (fixed-length) + Cipher data
 * @throws {Error} If inputs are invalid
 */
const encryptedBytes = (plaintext, secretBytes) => {
  if (!libsodium.crypto_secretbox_easy) {
    throw new Error('encryptedBytes cannot be called before libsodium.ready');
  }
  if (!plaintext || !secretBytes) {
    throw new Error('plaintext and secret are required');
  }
  if (secretBytes.length !== libsodium.crypto_secretbox_KEYBYTES) {
    throw new RangeError(`secret must be ${libsodium.crypto_secretbox_KEYBYTES} bytes`);
  }

  const nonceBytes = libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES);
  const cipherBytes = libsodium.crypto_secretbox_easy(plaintext, nonceBytes, secretBytes);
  const noncePlusCipher = new Uint8Array(nonceBytes.length + cipherBytes.length);
  noncePlusCipher.set(nonceBytes);
  noncePlusCipher.set(cipherBytes, nonceBytes.length);

  return noncePlusCipher;
};


/**
 * Encipher a plaintext message with the given secret.
 * @param  {string} plaintext [description]
 * @param  {string} secretHex [description]
 * @return {string} hexadecimal-encoded encrypted message
 * @throws {Error} If inputs are invalid
 */
const encrypt = (plaintext, secretHex) => {
  const secretBytes = fromHex(secretHex);
  return toHex(encryptedBytes(plaintext, secretBytes));
};

module.exports = {
  decrypt,
  deriveSecretKeyBytes,
  encrypt,
  fromHex,
  newSaltBytes,
  toHex,
};
