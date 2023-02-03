/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import injectAssetUrl from '../behaviours/injectAssetUrl';

const Audio = ({ url, description, ...props }) => <audio src={url} {...props}>{description}</audio>;

Audio.propTypes = {
  description: PropTypes.string,
  url: PropTypes.string.isRequired,
};

Audio.defaultProps = {
  description: '',
};

export { Audio };

export default injectAssetUrl(Audio);
