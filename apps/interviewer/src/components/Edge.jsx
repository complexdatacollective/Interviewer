import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeGetEdgeColor } from '../selectors/network';

class Edge extends PureComponent {
  render() {
    const {
      from, to, color, viewBoxScale,
    } = this.props;
    if (!from || !to) { return null; }
    return (
      <line
        x1={from.x * viewBoxScale}
        y1={from.y * viewBoxScale}
        x2={to.x * viewBoxScale}
        y2={to.y * viewBoxScale}
        stroke={`var(--${color})`}
      />
    );
  }
}

function mapStateToProps(state, props) {
  const getEdgeColor = makeGetEdgeColor();

  return {
    color: getEdgeColor(state, props),
  };
}

Edge.propTypes = {
  color: PropTypes.string.isRequired,
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  viewBoxScale: PropTypes.number.isRequired,
  /* eslint-disable react/no-unused-prop-types */
  type: PropTypes.string.isRequired,
};

export { Edge };

export default connect(mapStateToProps)(Edge);
