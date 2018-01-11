import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { assetUrl } from '../utils/protocol';

const BackgroundImage = ({ getAssetUrl, path, style, ...props }) => (
  <div
    style={{ ...style, backgroundImage: `url(${getAssetUrl(path)})` }}
    {...props}
  />
);

BackgroundImage.propTypes = {
  path: PropTypes.string.isRequired,
  style: PropTypes.object,
  getAssetUrl: PropTypes.func.isRequired,
};

BackgroundImage.defaultProps = {
  style: {},
};

const mapStateToProps = state => ({
  getAssetUrl: assetPath => assetUrl(state.protocol.path, assetPath),
});

export { BackgroundImage };

export default connect(mapStateToProps)(BackgroundImage);
