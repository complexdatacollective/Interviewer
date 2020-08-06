import React from 'react';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { SessionCard } from '../../components/Cards';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { getLastActiveSession } from '../../selectors/session';

const NewInterviewSection = (props) => {
  const {
    sessions,
    lastActiveSession,
    showSessionsOverlay,
  } = props;

  const ResumeOtherSessionLabel = `+${Object.keys(sessions).length - 1} Other Interview${Object.keys(sessions).length - 1 > 1 ? 's' : ''}...`;

  return (
    <motion.section layout className="start-screen-section resume-section">
      <main className="resume-section__content">
        <header>
          <h2>Resume Last Interview</h2>
        </header>
        <SessionCard
          sessionUUID={lastActiveSession.sessionUUID}
          attributes={lastActiveSession.attributes}
        />
        { Object.keys(sessions).length > 1 && (
          <aside className="setup-section__action">
            <h4>Manage All Interviews</h4>
            <div className="resume-card" onClick={showSessionsOverlay}>
              <h3>{ResumeOtherSessionLabel}</h3>
            </div>
          </aside>
        )}
      </main>
    </motion.section>
  );
};

NewInterviewSection.propTypes = {
};

NewInterviewSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showSessionsOverlay: () => dispatch(uiActions.update({ showSessionsOverlay: true })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewInterviewSection);

export { NewInterviewSection as UnconnectedNewInterviewSection };
