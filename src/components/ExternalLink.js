import React from 'react';
import PropTypes from 'prop-types';

import { isElectron } from '../utils/Environment';

export const openExternalLink = (href) => {
  if (isElectron()) {
    // eslint-disable-next-line global-require
    const { shell } = require('electron');
    shell.openExternal(href);
    return false;
  }

  window.open(href, '_system');
  return false;
};

const ExternalLink = ({ children, href }) => {
  const handleClick = (event) => {
    event.preventDefault();
    openExternalLink(href);
  };

  return (
    // eslint-disable-next-line jsx-a11y/href-no-hash
    <a href="#" onClick={handleClick}>
      {children}
    </a>
  );
};

ExternalLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

ExternalLink.defaultProps = {
  params: {},
};

export { ExternalLink };

export default ExternalLink;
