import { Directory } from '@capacitor/filesystem';

// A URI with a scheme (file://, content://) names a file outside the app's
// data directory, such as the copy the file picker hands back.
const URI_WITH_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;

/**
 * Translate one of the app's URL-string paths (rooted at userDataPath()='' or
 * tempDataPath()='tmp/') into @capacitor/filesystem coordinates. App paths are
 * stored under Directory.Data. A URI with a scheme is passed through without a
 * directory: Capacitor joins `path` onto `directory`, so a picked file's
 * file:// (iOS) or content:// (Android) URI would otherwise resolve inside
 * Directory.Data and fail to read.
 */
export const capacitorPath = (urlString) => {
  const path = String(urlString);

  if (URI_WITH_SCHEME.test(path)) {
    return { path };
  }

  return {
    directory: Directory.Data,
    path: path.replace(/^\/+/, ''),
  };
};
