import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeGetEdgeColor } from '../selectors/protocol';

const getEdgeColor = makeGetEdgeColor();

export class Edge extends PureComponent {
  render() {
    const { from, to, color, viewBoxScale } = this.props;
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
  return {
    color: getEdgeColor(state, props),
  };
}

Edge.propTypes = {
  color: PropTypes.string,
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  viewBoxScale: PropTypes.number.isRequired,
  /* eslint-disable react/no-unused-prop-types */
  type: PropTypes.string.isRequired,
};

Edge.defaultProps = {
  color: 'edge-color-seq-1',
};

export default connect(mapStateToProps)(Edge);
