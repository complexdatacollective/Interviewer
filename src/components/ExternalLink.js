import React from 'react';
import PropTypes from 'prop-types';
import { Browser } from '@capacitor/browser';
import { isElectron } from '../utils/Environment';

export const openExternalLink = async (href) => {
  if (isElectron()) {
    // eslint-disable-next-line global-require
    const { shell } = require('electron');
    shell.openExternal(href);
    return false;
  }

  await Browser.open({ url: href });
  return false;
};

const ExternalLink = ({ children, href }) => {
  const handleClick = (event) => {
    event.preventDefault();
    openExternalLink(href);
  };

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
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
