import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SessionCard as UISessionCard } from '@codaco/ui/lib/components/Cards';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

/**
  * Renders a card with details.
  */
const SessionCard = (props) => {
  const {
    sessionUUID,
    setSession,
    session,
    progress,
    protocol,
  } = props;

  const {
    caseId,
    startedAt,
    updatedAt,
  } = session;

  const onClickLoadSession = (event) => {
    event.preventDefault();
    setSession(sessionUUID);
  };

  return (
    <UISessionCard
      caseId={caseId}
      startedAt={startedAt}
      updatedAt={updatedAt}
      protocolName={protocol.name}
      progress={progress}
      onClickHandler={onClickLoadSession}
    />
  );
};

SessionCard.propTypes = {
  progress: PropTypes.number.isRequired,
  sessionUUID: PropTypes.string.isRequired,
  setSession: PropTypes.func.isRequired,
};

SessionCard.defaultProps = {
};

const mapStateToProps = (state, props) => {
  const session = state.sessions[props.sessionUUID];
  const protocol = get(state.installedProtocols, [session.protocolUID]);

  const progress = Math.round(
    (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
  );

  return {
    session,
    protocol,
    progress,
  };
};

const mapDispatchToProps = dispatch => ({
  setSession: bindActionCreators(sessionActions.setSession, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionCard);

