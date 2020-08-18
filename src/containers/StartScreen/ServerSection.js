import React from 'react';
import { connect } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { GraphicButton, Button } from '@codaco/ui';
import { Section, DiscoveredServerList } from '.';
import { Scroller } from '../../components';
import { ProtocolCard } from '../../components/Cards';

const ServerSection = (props) => {
  // const {
  // } = props;

  return (
    <Section className="start-screen-section server-section">
      <main className="server-section__main">
        <div className="content-area">
          <div className="content-area__discover">
            <header>
              <h2>Server</h2>
            </header>
            <DiscoveredServerList />
          </div>
          <div className="content-area__buttons">
            <Button color="platinum">Enter manual conection details</Button>
            <Button color="neon-coral">Unpair</Button>
            <Button>Fetch Protocol</Button>
          </div>
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
    pairedServer: state.pairedServer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerSection);

export { ServerSection as UnconnectedServerSection };
