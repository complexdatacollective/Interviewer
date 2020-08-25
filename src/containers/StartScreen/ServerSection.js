import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Section } from '.';
import DiscoveredServerList from '../Server/DiscoveredServerList';
import ServerAddressForm from './ServerAddressForm';
import { ExternalLink } from '../../components';

const ServerSection = (props) => {
  const {
    showServerAddressForm,
    toggleShowServerAddressForm,
    pairedServer,
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
            { !pairedServer ? (
              <React.Fragment>
                <p>
                  You must pair this device with this Server before you can securely exchange data.
                  This is a one-off process that allows your devices to identify each other. Visit
                  our <ExternalLink href="https://documentation.networkcanvas.com/docs/key-concepts/pairing/">documentation article</ExternalLink> on pairing to learn more.
                </p>
                <DiscoveredServerList />
              </React.Fragment>
            ) : (<h1>Server Card</h1>)}
          </div>
          <div className="content-area__buttons">
            { !pairedServer ? (
              <Button color="platinum" onClick={toggleShowServerAddressForm}>Provide manual connection details...</Button>
            ) : [
              <Button color="mustard--dark">Unpair</Button>,
              <Button color="platinum">Fetch Protocol</Button>,
            ]
            }
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
