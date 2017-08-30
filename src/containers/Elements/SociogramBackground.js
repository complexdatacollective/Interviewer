import React from 'react';
import PropTypes from 'prop-types';
import SociogramRadar from './SociogramRadar';

const SociogramBackground = ({ n, skewed, image }) => {
  let background;

  if (image) {
    background = <div className="sociogram-background__image" style={{ backgroundImage: `url(${image})` }} />;
  } else {
    background = <SociogramRadar n={n} skewed={skewed} />;
  }

  return (
    <div className="sociogram-background">
      { background }
    </div>
  );
};

SociogramBackground.propTypes = {
  n: PropTypes.number,
  skewed: PropTypes.bool,
  image: PropTypes.string,
};

SociogramBackground.defaultProps = {
  n: 4,
  skewed: true,
  image: null,
};

export default SociogramBackground;
