import React from 'react';
import PropTypes from 'prop-types';
import pathAsAssetUrl from '../behaviours/pathAsAssetUrl';

const Image = ({ assetUrl, alt, ...props }) =>
  <img src={assetUrl} alt={alt} {...props} />;

Image.propTypes = {
  alt: PropTypes.string,
  assetUrl: PropTypes.string.isRequired,
};

Image.defaultProps = {
  alt: '',
};

export { Image };

export default pathAsAssetUrl(Image);
