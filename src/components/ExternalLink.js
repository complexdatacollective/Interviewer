import React from 'react';
import PropTypes from 'prop-types';
import { shell } from 'electron';
import { isCordova, isElectron } from '../utils/Environment';

export const openExternalLink = (href) => {
  if (isElectron()) {
    shell.openExternal(href);
    return false;
  }

  if (isCordova()) {
    window.cordova.InAppBrowser.open(href, '_system', 'location=yes');
  }

  window.open(href, '_blank');

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

export { ExternalLink };

export default ExternalLink;
