/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import injectAssetUrl from '../behaviours/injectAssetUrl';

const Video = ({ url, description, ...props }) =>
  <video src={url} {...props} playsInline>{description}</video>;

Video.propTypes = {
  description: PropTypes.string,
  url: PropTypes.string.isRequired,
};

Video.defaultProps = {
  description: '',
};

export { Video };

export default injectAssetUrl(Video);
