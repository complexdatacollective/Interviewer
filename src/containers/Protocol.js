import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Stage from './Stage';

/**
  * Check protocol is loaded, and render the stage
  */
const Protocol = (props) => {
  if (!props.protocolLoaded) { return null; }

  return (
    <div className="protocol">
      <Stage />
    </div>
  );
};

Protocol.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolLoaded: state.protocol.loaded,
  };
}

export default connect(mapStateToProps)(Protocol);
