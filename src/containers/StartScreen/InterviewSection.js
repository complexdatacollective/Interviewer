import React from 'react';
import { connect } from 'react-redux';
import { GraphicButton } from '@codaco/ui';
import { getLastActiveSession } from '../../selectors/session';
import { Section } from '.';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';

const NewInterviewSection = (props) => {
  // const {
  // } = props;

  return (
    <Section className="start-screen-section interview-section">
      <main className="interview-section__start-new">
        <div className="content-area">
          <div className="content-area__last-used">
            <header>
              <h2>New Interview...</h2>
            </header>
            <ProtocolCard
              attributes={{
                schemaVersion: 5,
                lastModified: new Date(),
                installationDate: new Date(),
                name: 'Development Protocol',
                description: 'This is the development protocol',
              }}
            />
          </div>
          <div className="content-area__other">
            <h4>Select other Protocol...</h4>
            <Scroller>
              <ProtocolCard
                condensed
                attributes={{
                  schemaVersion: 5,
                  lastModified: new Date(),
                  installationDate: new Date(),
                  name: 'Development Protocol',
                  description: 'This is the development protocol',
                }}
              />
              <ProtocolCard
                condensed
                attributes={{
                  schemaVersion: 5,
                  lastModified: new Date(),
                  installationDate: new Date(),
                  name: 'Development Protocol',
                  description: 'This is the development protocol',
                }}
              />
              <ProtocolCard
                condensed
                attributes={{
                  schemaVersion: 5,
                  lastModified: new Date(),
                  installationDate: new Date(),
                  name: 'Development Protocol',
                  description: 'This is the development protocol',
                }}
              />
              <ProtocolCard
                condensed
                attributes={{
                  schemaVersion: 5,
                  lastModified: new Date(),
                  installationDate: new Date(),
                  name: 'Development Protocol',
                  description: 'This is the development protocol',
                }}
              />
              <ProtocolCard
                condensed
                attributes={{
                  schemaVersion: 5,
                  lastModified: new Date(),
                  installationDate: new Date(),
                  name: 'Development Protocol',
                  description: 'This is the development protocol',
                }}
              />
            </Scroller>
          </div>
        </div>
      </main>
      <main className="interview-section__install-section">
        <header>
          <h2>Install New Protocol</h2>
        </header>
        <div className="content-buttons">
          <GraphicButton
            color="sea-green"
          >
            <h3>Import</h3>
            <h2>From URL</h2>
          </GraphicButton>
          <GraphicButton
            color="slate-blue--dark"
          >
            <h3>Import</h3>
            <h2>From File</h2>
          </GraphicButton>
          <GraphicButton
            color="mustard"
          >
            <h3>Import</h3>
            <h2>From Server</h2>
          </GraphicButton>
        </div>
      </main>
    </Section>
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
