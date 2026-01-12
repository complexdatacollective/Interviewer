/**
 * Zip path validation with secure API support.
 * Moved from protocol-validation submodule to use network-canvas's own utilities.
 */
import environments from '../environments';
import inEnvironment from '../Environment';

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
 * Normalize a path (handle .. and . segments)
 * @private
 */
const normalizePath = (pathname) => {
  const parts = pathname.split('/');
  const result = [];
  for (const part of parts) {
    if (part === '..') {
      if (result.length === 0 || result[result.length - 1] === '..') {
        result.push(part);
      } else {
        result.pop();
      }
    } else if (part !== '.' && part !== '') {
      result.push(part);
    }
  }
  return result.join('/');
};

/**
 * Check if a path is absolute
 * @private
 */
const isAbsolutePath = (pathname) => pathname.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(pathname);

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
      if (normalizePath(pathname).startsWith('..')) {
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
      if (isAbsolutePath(pathname)) {
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

const checkZipPaths = inEnvironment((environment) => {
  if (environment === environments.ELECTRON || environment === environments.CORDOVA) {
    return (zipPaths) => new Promise((resolve, reject) => {
      try {
        zipPaths.forEach((pathname) => {
          assertNonEmptyPath(pathname);
          assertRelativePath(pathname);
          assertNoTraversalInPath(pathname);
        });
      } catch (err) {
        reject(err);
        return;
      }
      resolve();
    });
  }

  return () => Promise.reject(new Error('checkZipPaths() not available on platform'));
});

export {
  assertNonEmptyPath,
  assertNoTraversalInPath,
  assertRelativePath,
  checkZipPaths,
};
