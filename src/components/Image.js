import React from 'react';
import PropTypes from 'prop-types';
import injectAssetUrl from '../behaviours/injectAssetUrl';

const Image = ({ url, alt, ...props }) => <img src={url} alt={alt} {...props} />;

Image.propTypes = {
  alt: PropTypes.string,
  url: PropTypes.string.isRequired,
};

Image.defaultProps = {
  alt: '',
};

export { Image };

export default injectAssetUrl(Image);
