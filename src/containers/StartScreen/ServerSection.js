import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Section } from '.';
import DiscoveredServerList from '../Server/DiscoveredServerList';
import ServerAddressForm from './ServerAddressForm';

const ServerSection = (props) => {
  const {
    showServerAddressForm,
    toggleShowServerAddressForm,
  } = props;

  return (
    <Section className="start-screen-section server-section">
      <ServerAddressForm show={showServerAddressForm} handleClose={toggleShowServerAddressForm} />
      <main className="server-section__main">
        <div className="content-area">
          <div className="content-area__discover">
            <header>
              <h2>Server</h2>
            </header>
            <DiscoveredServerList />
          </div>
          <div className="content-area__buttons">
            <Button color="platinum" onClick={toggleShowServerAddressForm}>Enter manual connection details</Button>
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
    showServerAddressForm: state.ui.showServerAddressForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleShowServerAddressForm: () => dispatch(uiActions.toggle('showServerAddressForm')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerSection);

export { ServerSection as UnconnectedServerSection };
