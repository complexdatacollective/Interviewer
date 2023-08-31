/* global device */

import { isIOS } from '../Environment';
import getAssetUrl from './getAssetUrl';

/**
 * An enhanced version of assetUrl, which returns urls suitable for streaming
 * video/audio on cordova.
 */
const getMediaAssetUrl = (protocolName, assetPath) => {
  // iOS needs special handling, because it doesn't support file:// URLs for WKWebView.
  if (isIOS()) {
    return getAssetUrl(protocolName, assetPath)
      .then(sourceFilename => {
        // convertFilePath is an undocumented method (classic cordova! 🙄). It
        // takes a file:// path, and converts it to use the scheme preference
        // from our config.xml (which is app://).
        const convertedPath = window.WkWebView.convertFilePath(sourceFilename);
        console.info('getMediaAssetUrl: converting file path', sourceFilename, convertedPath);
        return convertedPath;
      });
  }

  return getAssetUrl(protocolName, assetPath);
};

export default getMediaAssetUrl;
