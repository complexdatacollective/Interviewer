import React from 'react';
import PropTypes from 'prop-types';
import pathAsAssetUrl from '../behaviours/pathAsAssetUrl';

const BackgroundImage = ({ style, assetUrl, ...props }) =>
  (
    <div
      style={{ ...style, backgroundImage: `url(${assetUrl})` }}
      {...props}
    />
  );

BackgroundImage.propTypes = {
  style: PropTypes.object,
  assetUrl: PropTypes.string.isRequired,
};

BackgroundImage.defaultProps = {
  style: {},
};

export { BackgroundImage };

export default pathAsAssetUrl(BackgroundImage);
