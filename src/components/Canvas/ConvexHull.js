import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export class ConvexHull extends PureComponent {
  render() {
    const { color, points } = this.props;

    const hullClasses = `convex-hull convex-hull__${color}`;

    return (
      <svg className={hullClasses} xmlns="http://www.w3.org/2000/svg">
        <polygon points={points} />
      </svg>
    );
  }
}

ConvexHull.propTypes = {
  color: PropTypes.string,
  points: PropTypes.string.isRequired,
};

ConvexHull.defaultProps = {
  color: 'cat-color-seq-1',
};

export default ConvexHull;
