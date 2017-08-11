import React from 'react';
import PropTypes from 'prop-types';

const SociogramBackgroundImage = ({ image }) => (
  <div className="sociogram-background-image" style={{ backgroundImage: `url(${image})` }} />
);

SociogramBackgroundImage.propTypes = {
  image: PropTypes.string.isRequired,
};

export default SociogramBackgroundImage;
