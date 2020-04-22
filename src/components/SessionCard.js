import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@codaco/ui';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { ProgressBar } from '../components';

const formatDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const SessionCard = (props) => {
  const {
    setSession,
    attributes,
    sessionUUID,
    installedProtocols,
    isSelected,
  } = props;

  const {
    caseId,
    protocolUID,
    progress,
    updatedAt,
    lastExportedAt,
  } = attributes;

  const classes = cx({
    'session-card': true,
    'session-card--selected': isSelected(sessionUUID),
  });

  return (
    <motion.div
      className={classes}
      key={sessionUUID}
    >
      <div className="session-card__content">
        <div className="progress-wrapper">
          <ProgressBar percentProgress={progress} />
          <h6>{progress}%</h6>
        </div>
        <div className="card__attributes">
          <h1 className="card__label">
            { caseId }
          </h1>
          <h5 className="session-card__attribute">
            Protocol: { installedProtocols[protocolUID].name || '[Unavailable protocol]'}
          </h5>
          <h5 className="session-card__attribute">
            Last Changed: { formatDate(updatedAt) }
          </h5>
          <h5 className="session-card__attribute">
            Last Exported: { lastExportedAt ? formatDate(lastExportedAt) : 'Not yet exported' }
          </h5>
        </div>
      </div>
      <Button
        color="neon-coral"
        onClick={(e) => { e.preventDefault(); setSession(sessionUUID); }}
      >
        Resume
      </Button>
    </motion.div>
  );
};

SessionCard.propTypes = {
  attributes: PropTypes.object.isRequired,
  sessionUUID: PropTypes.string.isRequired,
  setSession: PropTypes.func.isRequired,
};

SessionCard.defaultProps = {
};

function mapStateToProps(state) {
  return {
    isSelected: uuid => state.selectedSessions && state.selectedSessions.includes(uuid),
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SessionCard);

