/**
 * External link component with secure API support.
 */

import { Browser } from '@capacitor/browser';
import PropTypes from 'prop-types';

import { isCapacitor, isElectron } from '../utils/Environment';

const openExternalLink = (href) => {
  if (isElectron()) {
    if (window.electronAPI?.shell?.openExternal) {
      window.electronAPI.shell.openExternal(href);
    }
    return false;
  }

  if (isCapacitor()) {
    Browser.open({ url: href }).catch((error) => {
      console.error('[external link] failed to open:', error);
    });
    return false;
  }

  return false;
};

const ExternalLink = ({ children, href }) => {
  const handleClick = (event) => {
    event.preventDefault();
    openExternalLink(href);
  };

  return (
    <a href="#" onClick={handleClick}>
      {children}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

export { openExternalLink };

export default ExternalLink;
