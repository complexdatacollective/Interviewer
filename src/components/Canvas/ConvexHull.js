import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export class ConvexHull extends PureComponent {
  render() {
    const { color, points } = this.props;
    const hullColor = `var(--${color})`;
    console.log(points);
    return (
      <svg style={{ background: color, position: 'absolute', top: 0, left: 0 }} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points={points} style={{ strokeLinejoin: 'round', stroke: hullColor, strokeWidth: 'calc(var(--base-node-size) / 2)', mixBlendMode: 'screen', fill: hullColor }} />
      </svg>
    );
  }
}

ConvexHull.propTypes = {
  color: PropTypes.string,
  points: PropTypes.array.isRequired,
};

ConvexHull.defaultProps = {
  color: 'cat-color-seq-1',
};

export default ConvexHull;
