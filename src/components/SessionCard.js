import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { ProgressBar } from '../components';

const formatDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

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
    updatedAt,
    lastExportedAt,
    stageIndex,
  } = attributes;

  const classes = cx({
    'session-card': true,
    'session-card--selected': isSelected(sessionUUID),
  });

  const progress = Math.round(
    (oneBasedIndex(stageIndex) / oneBasedIndex(get(installedProtocols, [protocolUID, 'stages'], []).length)) * 100,
  );

  return (
    <motion.div
      className={classes}
      key={sessionUUID}
      onClick={() => setSession(sessionUUID)}
    >
      <div className="session-card__content">
        <div className="meta-wrapper">
          <div className="progress-wrapper">
            <h6>{progress}% Complete</h6>
            <ProgressBar percentProgress={progress} orientation="horizontal" />
          </div>
          <div className="meta">
            <h6>
              Protocol: { installedProtocols[protocolUID].name || '[Unavailable protocol]'}
            </h6>
            <h6 className="meta-wrapper__attribute">
              Last Changed: { formatDate(updatedAt) }
            </h6>
            <h6 className="meta-wrapper__attribute">
              Last Exported:&nbsp;{ lastExportedAt ? formatDate(lastExportedAt) : (<span className="highlight">Not yet exported</span>) }
            </h6>
          </div>
        </div>
        <div className="main-wrapper">
          <h2 className="card__label">
            { caseId }
          </h2>
        </div>
      </div>
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

