import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const UpdateBanner = (props) => {
  const {
    updateStatus,
    updateError,
  } = props;

  const renderMessage = () => {
    if (updateStatus === 'blocked') {
      return 'Important updates are available, but they cannot be installed until you have exported all existing interviews.';
    }

    if (updateStatus === 'pending') {
      return 'Network Canvas will be updated next time it is restarted.';
    }

    if (updateStatus === 'error') {
      return `There was an error checking for updates: ${updateError}`;
    }

    return null;
  };

  if (!updateStatus || updateStatus === 'unavailable') {
    return null;
  }

  return (
    <div style={{ background: 'tomato', width: '100%', textAlign: 'center' }}>
      <h4>{renderMessage()}</h4>
    </div>
  );
};

UpdateBanner.propTypes = {
  updateStatus: PropTypes.string.isRequired,
  updateError: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    updateStatus: state.update.status,
    updateError: state.update.error,
  };
}


export default connect(mapStateToProps)(UpdateBanner);
