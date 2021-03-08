import React from 'react';
import PropTypes from 'prop-types';
import emoji from 'emoji-dictionary';

const emojiTextRenderer = (text) => text.replace(/:\w+:/gi, (name) => emoji.getUnicode(name));

const externalLinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

externalLinkRenderer.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired,
};

const defaultMarkdownRenderers = {
  text: emojiTextRenderer,
  link: externalLinkRenderer,
};

export default defaultMarkdownRenderers;

export {
  emojiTextRenderer,
  externalLinkRenderer,
};
