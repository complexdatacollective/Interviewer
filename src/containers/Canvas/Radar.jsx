import React from 'react';
import PropTypes from 'prop-types';
import { range, last, zipWith } from 'lodash';
import color from 'color';
import { getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';

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

const equalByIncrement = (outerRadius, n) => range(1, n + 1)
  .map((v) => (v * outerRadius) / n)
  .reverse();

// Weight towards `a` by factor
const weightedAverage = (a, b, factor = 1) => zipWith(
  a,
  b,
  (c, d) => ((c * factor) + d) / (1 + factor),
);

const Radar = ({ n, skewed }) => {
  const num = parseInt(n, 10);
  if (Number.isNaN(num) || !num) {
    return null;
  }

  const radii = skewed
    ? weightedAverage(equalByArea(50, num), equalByIncrement(50, num), 3)
    : equalByIncrement(50, num);

  const colorRing = color(getCSSVariableAsString('--ring--accent'));
  const colorBackground = color(getCSSVariableAsString('--ring--background'));

  const ringFill = (ring) => {
    const mix = (ring + 1) / num;
    const colorMix = color(colorBackground).mix(colorRing, mix);
    const hexColorMix = colorMix.hex();
    return hexColorMix;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="canvas-radar">
      {radii.map((radius, index) => (
        <circle key={index} cx="50" cy="50" r={radius} className="canvas-radar__range" fill={ringFill(index)} />
      ))}
    </svg>
  );
};

Radar.propTypes = {
  n: PropTypes.number,
  skewed: PropTypes.bool,
};

Radar.defaultProps = {
  n: 4,
  skewed: true,
};

export default Radar;
