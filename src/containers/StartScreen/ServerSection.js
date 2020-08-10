import React from 'react';
import { connect } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { GraphicButton } from '@codaco/ui';
import { Section } from '.';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';

const ServerSection = (props) => {
  // const {
  // } = props;

  return (
    <Section className="start-screen-section server-section">
      <main className="server-section__content">
        <header>
          <h2>Server</h2>
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

ServerSection.propTypes = {
};

ServerSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerSection);

export { ServerSection as UnconnectedServerSection };
