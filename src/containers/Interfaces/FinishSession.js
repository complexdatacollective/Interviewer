import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import { isPreview } from '../../utils/Environment';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const FinishSession = ({ endSession }) => {
  const dispatch = useDispatch();
  const handleFinishSession = () => {
    endSession(false, true);
  };

  useEffect(() => {
    dispatch({ type: 'PLAY_SOUND', sound: 'finishSession' });
  }, []);

  return (
    <div className="interface finish-session-interface">
      <div className="finish-session-interface__frame">
        <h1 className="finish-session-interface__title type--title-1">
          Finish Interview
        </h1>
        <div className="finish-session-interface__section finish-session-interface__section--instructions">
          <p>
            You have reached the end of the interview.
            If you are satisfied with the information you have entered, you may finish the
            interview now.
          </p>
        </div>
        {!isPreview()
          && (
            <div className="finish-session-interface__section finish-session-interface__section--buttons">
              <Button onClick={handleFinishSession}>
                Finish
              </Button>
            </div>
          )}
      </div>
    </div>
  );
};

FinishSession.propTypes = {
  endSession: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  endSession: sessionActions.endSession,
};

export default connect(null, mapDispatchToProps)(FinishSession);

export { FinishSession as UnconnectedFinishSession };
