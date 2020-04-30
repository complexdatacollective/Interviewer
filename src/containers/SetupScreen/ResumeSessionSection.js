import React from 'react';
import { sortBy, values, mapValues, omit } from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { SessionCard } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';

const NewInterviewSection = (props) => {
  const {
    sessions,
    lastActiveSession,
    showSessionsOverlay,
  } = props;

  const ResumeOtherSessionLabel = `+${Object.keys(sessions).length - 1} Other Interview${Object.keys(sessions).length - 1 > 1 ? 's' : null}...`;

  return (
    <React.Fragment>
      {Object.keys(sessions).length > 0 && (
        <section className="setup-section resume-section">
          <main className="section-wrapper">
            <section className="setup-section__content">
              <header>
                <h1>Resume an Interview</h1>
                <h3>Last Active Interview...</h3>
              </header>
              <SessionCard
                sessionUUID={lastActiveSession.sessionUUID}
                attributes={lastActiveSession.attributes}
              />
            </section>
            { Object.keys(sessions).length > 2 && (
              <aside className="setup-section__action">
                <h4>Manage All Interviews</h4>
                <div className="resume-card" onClick={showSessionsOverlay}>
                  <h3>{ResumeOtherSessionLabel}</h3>
                </div>
              </aside>
            )}
          </main>
        </section>
      )}
    </React.Fragment>
  );
};

NewInterviewSection.propTypes = {
};

NewInterviewSection.defaultProps = {
};

function mapStateToProps(state) {
  const getLastActiveSession = () => {
    const sessionsCollection = values(mapValues(state.sessions, (session, sessionUUID) => { session['sessionUUID'] = sessionUUID; return session; }));
    const lastActive = sortBy(sessionsCollection, ['updatedAt'])[0];
    return {
      sessionUUID: lastActive.sessionUUID,
      [entityAttributesProperty]: {
        ...omit(lastActive, 'sessionUUID'),
      },
    };
  };

  return {
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showSessionsOverlay: () => dispatch(uiActions.update({ showSessionsOverlay: true })),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewInterviewSection));

export { NewInterviewSection as UnconnectedNewInterviewSection };
