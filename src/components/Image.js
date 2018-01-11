import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { assetUrl } from '../utils/protocol';

const Image = ({ getAssetUrl, path, alt, ...props }) =>
  <img src={getAssetUrl(path)} alt={alt} {...props} />;

Image.propTypes = {
  alt: PropTypes.string,
  path: PropTypes.string.isRequired,
  getAssetUrl: PropTypes.func.isRequired,
};

Image.defaultProps = {
  alt: '',
};

const mapStateToProps = state => ({
  getAssetUrl: assetPath => assetUrl(state.protocol.path, assetPath),
});

export { Image };

export default connect(mapStateToProps)(Image);
