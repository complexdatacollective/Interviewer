import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as updateActions } from '../ducks/modules/update';

const UpdateBanner = (props) => {
  const {
    updateStatus,
    updateError,
    dismissed,
    dismiss,
  } = props;

  const renderMessage = () => {
    if (updateStatus === 'blocked') {
      return (
        <p>
          Important updates are available, but they cannot be installed until you have
          exported all existing interviews.
          <Button size="small" color="platinum" style={{ marginTop: '1.2rem' }}>
            More information
          </Button>
        </p>
      );
    }

    if (updateStatus === 'pending') {
      return (
        <p>
          Network Canvas will be updated to the latest version next time it is restarted.
        </p>
      );
    }

    if (updateStatus === 'error') {
      return (<p>There was an error during the update process: {updateError}</p>);
    }

    return null;
  };

  if (!updateStatus || updateStatus === 'unavailable') {
    return null;
  }

  const bgColor = () => {
    if (updateStatus === 'blocked') {
      return 'tomato';
    }

    if (updateStatus === 'error') {
      return 'var(--error)';
    }

    if (updateStatus === 'pending') {
      return 'var(--primary)';
    }

    return 'tomato';
  };

  return (
    <AnimatePresence>
      { !dismissed && (
        <motion.div
          key={updateStatus}
          onClick={() => dismiss()}
          style={{
            background: bgColor(),
            width: '65%',
            textAlign: 'center',
            position: 'absolute',
            top: 0,
            padding: '0 1.2rem',
            fontSize: '0.8rem',
            fontWeight: '900',
            borderRadius: '0 0 0.75rem 0.75rem',
            boxShadow: '0 0 4rem 0 var(--modal-window-box-shadow)',
          }}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
        >
          {renderMessage()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

UpdateBanner.propTypes = {
  updateStatus: PropTypes.string.isRequired,
  updateError: PropTypes.string.isRequired,
  dismissed: PropTypes.bool.isRequired,
  dismiss: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    updateStatus: state.update.status,
    updateError: state.update.error,
    dismissed: state.update.dismissed,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dismiss: bindActionCreators(updateActions.setUpdateDismissed, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(UpdateBanner);
