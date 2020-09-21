import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { SessionCard as UISessionCard } from '@codaco/ui/lib/components/Cards';
import { useSelector, useDispatch } from 'react-redux';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

/**
  * Renders a card with details.
  */
const SessionCard = (props) => {
  const {
    sessionUUID,
  } = props;

  const dispatch = useDispatch();
  const setSession = session => dispatch(sessionActions.setSession(session));

  const session = useSelector(state => state.sessions[sessionUUID]);
  const protocol = useSelector(state => get(state.installedProtocols, [session.protocolUID]));
  const progress = Math.round(
    (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
  );

  const {
    caseId,
    startedAt,
    updatedAt,
    exportedAt,
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
      exportedAt={exportedAt}
      protocolName={protocol.name}
      progress={progress}
      onClickHandler={onClickLoadSession}
    />
  );
};

SessionCard.propTypes = {
  sessionUUID: PropTypes.string.isRequired,
};

SessionCard.defaultProps = {
};

export default SessionCard;
