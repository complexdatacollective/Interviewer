import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { colorDictionary } from 'network-canvas-ui';
import { edgeCoords } from '../../selectors/edges';

export const EdgeLayout = ({ edges, color }) => {
  const strokeColor = color ? colorDictionary[color] : colorDictionary['edge-base'];

  return (
    <div className="edge-layout">
      <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        { edges.map(({ key, from, to }) => {
          if (!from || !to) { return null; }
          return (
            <line
              key={key}
              x1={from.x * 100}
              y1={from.y * 100}
              x2={to.x * 100}
              y2={to.y * 100}
              stroke={strokeColor}
            />
          );
        }) }
      </svg>
    </div>
  );
};

EdgeLayout.propTypes = {
  edges: PropTypes.array.isRequired,
  color: PropTypes.string,
};

EdgeLayout.defaultProps = {
  color: null,
};

function mapStateToProps(state, ownProps) {
  return {
    edges: edgeCoords(ownProps.type, ownProps.layout)(state),
  };
}

export default connect(mapStateToProps)(EdgeLayout);
