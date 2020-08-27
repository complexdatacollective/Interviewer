import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphicButton, Button } from '@codaco/ui';
import { Section } from '.';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import ProtocolUrlForm from './ProtocolUrlForm';
import importLocalProtocol from '../../utils/protocol/importLocalProtocol';

const ImportSection = (props) => {
  const {
    pairedServer,
    installedProtocols,
    toggleShowProtocolUrlForm,
    showProtocolUrlForm,
  } = props;

  return (
    <Section className="start-screen-section import-section">
      <main className="import-section__install-section">
        <header>
          <h2>Import a Protocol</h2>
        </header>
        <motion.div layout className="content-buttons">
          <AnimatePresence>
            <GraphicButton
              key="protocol-url"
              color="sea-green"
              onClick={toggleShowProtocolUrlForm}
            >
              <h3>Import</h3>
              <h2>From URL</h2>
            </GraphicButton>
            <GraphicButton
              key="protocol-file"
              color="slate-blue--dark"
              onClick={importLocalProtocol}
            >
              <h3>Import</h3>
              <h2>From File</h2>
            </GraphicButton>
            {
              pairedServer && (
                <GraphicButton
                  key="protocol-server"
                  color="mustard"
                >
                  <h3>Import</h3>
                  <h2>From Server</h2>
                </GraphicButton>
              )
            }
          </AnimatePresence>
        </motion.div>
      </main>
      { Object.keys(installedProtocols).length > 0 && (
        <footer className="import-section__manage-protocols">
          <Button color="platinum">Manage Protocols...</Button>
        </footer>
      )}
      <ProtocolUrlForm show={showProtocolUrlForm} handleClose={toggleShowProtocolUrlForm} />
    </Section>
  );
};

ImportSection.propTypes = {
};

ImportSection.defaultProps = {
  pairedServer: null,
};

function mapStateToProps(state) {
  return {
    pairedServer: state.pairedServer,
    installedProtocols: state.installedProtocols,
    showProtocolUrlForm: state.ui.showProtocolUrlForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleShowProtocolUrlForm: () => dispatch(uiActions.toggle('showProtocolUrlForm')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportSection);

export { ImportSection as UnconnectedImportSection };
