import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export class ConvexHull extends PureComponent {
  render() {
    const { color, points } = this.props;

    return (
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" points={points}>
        <path d="M10 10 H 90 V 90 H 10 L 10 10" />
        <circle cx="10" cy="10" r="2" fill={color} />
        <circle cx="90" cy="90" r="2" fill={color} />
        <circle cx="90" cy="10" r="2" fill={color} />
        <circle cx="10" cy="90" r="2" fill={color} />
      </svg>
    );
  }
}

ConvexHull.propTypes = {
  color: PropTypes.string,
  points: PropTypes.array.isRequired,
};

ConvexHull.defaultProps = {
  color: 'edge-color-seq-1',
};

export default ConvexHull;
