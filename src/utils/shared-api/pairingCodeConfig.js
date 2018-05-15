/**
 * Copied verbatim from Server! TODO: shared submodule.
 */

const characters = 'abcdefghijklmnopqrstuvwxyz';
const CharacterSet = Object.freeze(characters.split(''));
const PairingCodeLength = 16;

module.exports = {
  CharacterSet,
  PairingCodeLength,
};
