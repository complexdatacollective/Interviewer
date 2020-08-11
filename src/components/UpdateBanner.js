import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as updateActions } from '../ducks/modules/update';
import { openExternalLink } from './ExternalLink';

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
        <React.Fragment>
          <p>
            Important improvements to Network Canvas are available, but they cannot be
            applied while there are sessions on this device.
          </p>
          <div>
            <Button size="small" color="neon-coral--dark" style={{ marginRight: '0.6rem' }} onClick={dismiss}>
            Dismiss
            </Button>
            <Button size="small" color="primary" style={{ marginRight: '0.6rem' }}>
            Automatically Remove all sessions
            </Button>
            <Button
              onClick={() => openExternalLink('https://documentation.networkcanvas.com')}
              size="small"
              color="platinum"
              style={{ marginTop: '0.6rem' }}
            >
              More information
            </Button>
          </div>
        </React.Fragment>
      );
    }

    if (updateStatus === 'pending') {
      return (
        <React.Fragment>
          <p>
            Improvements to Network Canvas will be applied next time it is restarted.
          </p>
          <Button size="small" color="platinum--dark" style={{ marginLeft: '0.6rem' }} onClick={dismiss}>
            Dismiss
          </Button>
        </React.Fragment>
      );
    }

    if (updateStatus === 'error') {
      // eslint-disable-next-line no-console
      console.log('Update error:', updateError);
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
          style={{
            background: bgColor(),
            width: '65%',
            maxWidth: '50rem',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            position: 'absolute',
            top: '-2rem',
            padding: '2.6rem 1.2rem 0.6rem 1.2rem',
            fontSize: '0.8rem',
            fontWeight: '900',
            borderRadius: '0 0 3.75rem 3.75rem',
            boxShadow: '0 0 4rem 0 var(--modal-window-box-shadow)',
          }}
          initial={{ y: '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 50, duration: 0.5 }}
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
