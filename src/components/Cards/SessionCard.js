import React from 'react';
import PropTypes from 'prop-types';
import { SessionCard as UISessionCard } from '@codaco/ui/lib/components/Cards';
import { useSelector, useDispatch } from 'react-redux';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import formatDatestamp from '../../utils/formatDatestamp';

const oneBasedIndex = (i) => parseInt(i || 0, 10) + 1;

const SessionCard = ({
  sessionUUID,
}) => {
  const sessions = useSelector((state) => state.sessions);
  const session = sessions[sessionUUID];
  const installedProtocols = useSelector((state) => state.installedProtocols);

  if (!session) { return null; }

  const dispatch = useDispatch();
  const setSession = (sessionUID) => dispatch(sessionActions.setSession(sessionUID));

  const {
    caseId,
    startedAt,
    updatedAt,
    exportedAt,
    finishedAt,
    protocolUID,
    stageIndex,
  } = session;

  const protocol = installedProtocols[protocolUID];

  const {
    name,
    stages,
  } = protocol;

  const progress = Math.round(
    (oneBasedIndex(stageIndex) / oneBasedIndex(stages.length)) * 100,
  );

  const onClickLoadSession = (event) => {
    event.preventDefault();
    setSession(sessionUUID);
  };

  return (
    <UISessionCard
      caseId={caseId}
      startedAt={formatDatestamp(startedAt)}
      updatedAt={formatDatestamp(updatedAt)}
      exportedAt={formatDatestamp(exportedAt)}
      finishedAt={formatDatestamp(finishedAt)}
      protocolName={name}
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
