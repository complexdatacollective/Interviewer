import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Stage from './Stage';

/**
  * Load protocol data, and render a stage
  * @extends Component
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
