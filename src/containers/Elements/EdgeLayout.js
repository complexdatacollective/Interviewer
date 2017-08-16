import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { edgeCoordsForPrompt } from '../../selectors/edges';

const EdgeLayout = ({ edgeCoords }) => (
  <div className="edge-layout">
    <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      { edgeCoords.map(({ key, from, to }) => {
        if (!from || !to) { return null; }
        return <line key={key} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
      }) }
    </svg>
  </div>
);

EdgeLayout.propTypes = {
  edgeCoords: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    edgeCoords: edgeCoordsForPrompt(state),
  };
}

export default connect(mapStateToProps)(EdgeLayout);
