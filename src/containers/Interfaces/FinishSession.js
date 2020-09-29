import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import Scroller from '../../components/Scroller';

const FinishSession = ({ endSession }) => {
  const handleFinishSession = () => {
    endSession(false, true);
  };

  return (
    <div className="interface finish-session-interface">
      <div className="finish-session-interface__frame">
        <h1 className="finish-session-interface__title type--title-1">
          Finish Interview
        </h1>
        <Scroller>
          <div className="finish-session-interface__section finish-session-interface__section--instructions">
            <p>
              You have reached the end of the interview.
              If you are satisfied with the information you have entered, you may finish the
              interview now.
            </p>
          </div>
        </Scroller>
        <div className="finish-session-interface__section finish-session-interface__section--buttons">
          <Button onClick={handleFinishSession}>
            Finish
          </Button>
        </div>
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
