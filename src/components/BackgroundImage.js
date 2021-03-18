import React from 'react';
import PropTypes from 'prop-types';
import injectAssetUrl from '../behaviours/injectAssetUrl';

const BackgroundImage = ({ style, url, ...props }) => (
  <div
    style={{ ...style, backgroundImage: `url(${url})` }}
    {...props}
  />
);

BackgroundImage.propTypes = {
  style: PropTypes.object,
  url: PropTypes.string.isRequired,
};

BackgroundImage.defaultProps = {
  style: {},
};

export { BackgroundImage };

export default injectAssetUrl(BackgroundImage);
