import { Directory } from '@capacitor/filesystem';

/**
 * Translate one of the app's URL-string paths (rooted at userDataPath()='' or
 * tempDataPath()='tmp/') into @capacitor/filesystem coordinates. Everything is
 * stored under Directory.Data.
 */
export const capacitorPath = (urlString) => ({
  directory: Directory.Data,
  path: String(urlString).replace(/^\/+/, ''),
});
