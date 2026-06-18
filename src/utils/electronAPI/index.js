export const pathSync = {
  join: (...args) => {
    const parts = args
      .filter((arg) => arg != null && arg !== '')
      .map((arg) => String(arg).replace(/\\/g, '/'));

    if (parts.length === 0) return '.';

    let joined = parts.join('/');
    // Normalize multiple slashes but preserve leading //
    joined = joined.replace(/\/+/g, '/');
    // Remove trailing slash unless it's the root
    if (joined.length > 1 && joined.endsWith('/')) {
      joined = joined.slice(0, -1);
    }
    return joined;
  },
  basename: (filePath, ext) => {
    if (!filePath) return '';
    const parts = filePath.replace(/\\/g, '/').split('/');
    let base = parts[parts.length - 1] || parts[parts.length - 2] || '';
    if (ext && base.endsWith(ext)) {
      base = base.slice(0, -ext.length);
    }
    return base;
  },
  dirname: (filePath) => {
    if (!filePath) return '.';
    const normalized = filePath.replace(/\\/g, '/');
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash === -1) return '.';
    if (lastSlash === 0) return '/';
    return normalized.slice(0, lastSlash);
  },
  extname: (filePath) => {
    if (!filePath) return '';
    const base = pathSync.basename(filePath);
    const dotIndex = base.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === 0) return '';
    return base.slice(dotIndex);
  },
  parse: (filePath) => {
    const base = pathSync.basename(filePath);
    const ext = pathSync.extname(filePath);
    const name = ext ? base.slice(0, -ext.length) : base;
    return {
      root: filePath.startsWith('/') ? '/' : '',
      dir: pathSync.dirname(filePath),
      base,
      ext,
      name,
    };
  },
};
