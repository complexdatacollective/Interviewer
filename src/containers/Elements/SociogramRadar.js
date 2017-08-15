import React from 'react';
import PropTypes from 'prop-types';
import { range, last, zipWith } from 'lodash';

const equalByArea = (outerRadius, n) => {
  const rsq = outerRadius ** 2;
  const b = rsq / n;

  return range(1, n + 1)
  .reduce((memo) => {
    const previous = last(memo) || 0;
    const next = (b + (previous ** 2)) ** 0.5;
    return [...memo, next];
  }, [])
  .reverse();
};

const equalByIncrement = (outerRadius, n) =>
  range(1, n + 1)
  .map(v => (v * outerRadius) / n)
  .reverse();

// Weight towards a by factor
const weightedAverage = (a, b, factor = 1) =>
  zipWith(a, b, (c, d) => ((c * factor) + d) / (1 + factor));

const SociogramRadar = ({ n, skewed }) => {
  const radii = skewed ?
    weightedAverage(equalByArea(50, n), equalByIncrement(50, n), 3) :
    equalByIncrement(50, n);

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="sociogram-radar">
      {radii.map((radius, index) => (
        <circle key={index} cx="50" cy="50" r={radius} className="sociogram-radar__range" />
      ))}
    </svg>
  );
};

SociogramRadar.propTypes = {
  n: PropTypes.number,
  skewed: PropTypes.bool,
};

SociogramRadar.defaultProps = {
  n: 4,
  skewed: true,
};

export default SociogramRadar;
