import environments from '../../environments';
import inEnvironment from '../../Environment';

/**
 * @param {string} pathname a pathname contained in a protocol archive
 * @throws {Error} if pathname is falsy
 */
const assertNonEmptyPath = (pathname) => {
  if (!pathname) {
    throw new Error('Invalid archive (empty paths not allowed)');
  }
};

/**
 * Guard against directory traversal / escape
 * On Cordova, no traversal is allowed (even if it doesn't result in escaping the directory).
 * @param {string} pathname a pathname contained in a protocol archive
 * @throws {Error} If pathname escapes directory
 */
const assertNoTraversalInPath = inEnvironment((environment) => {
  const message = 'Invalid archive (directory traversal not allowed)';
  if (environment === environments.ELECTRON) {
    return (pathname) => {
      // eslint-disable-next-line global-require
      if (require('path').normalize(pathname).startsWith('..')) {
        throw new Error(message);
      }
    };
  }
  if (environment === environments.CORDOVA) {
    return (pathname) => {
      if (pathname.startsWith('..') || pathname.includes('../')) {
        throw new Error(message);
      }
    };
  }
  throw new Error('assertNoTraversalInPath() not available on platform');
});

/**
 * @param {string} pathname a pathname contained in a protocol archive
 * @throws {Error} If pathname is absolute
 */
const assertRelativePath = inEnvironment((environment) => {
  const message = 'Invalid archive (absolute paths not allowed)';
  if (environment === environments.ELECTRON) {
    return (pathname) => {
      // eslint-disable-next-line global-require
      if (require('path').isAbsolute(pathname)) {
        throw new Error(message);
      }
    };
  }
  if (environment === environments.CORDOVA) {
    return (pathname) => {
      if (pathname.startsWith('/')) {
        throw new Error(message);
      }
    };
  }
  throw new Error('assertRelativePath() not available on platform');
});

export {
  assertNonEmptyPath,
  assertNoTraversalInPath,
  assertRelativePath,
};
