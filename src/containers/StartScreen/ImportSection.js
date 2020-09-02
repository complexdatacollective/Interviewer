import React from 'react';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphicButton, Button } from '@codaco/ui';
import { Section } from '.';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import ProtocolUrlForm from './ProtocolUrlForm';
import importLocalProtocol from '../../utils/protocol/importLocalProtocol';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';

const ImportSection = (props) => {
  const {
    pairedServer,
    installedProtocols,
    toggleShowProtocolUrlForm,
    showProtocolUrlForm,
  } = props;

  const onlineStatus = useOnlineStatus();
  const pairedServerConnection = useServerConnectionStatus(pairedServer);

  return (
    <Section className="start-screen-section import-section">
      <motion.main layout className="import-section__install-section">
        <motion.header layout>
          <h2>Import a Protocol</h2>
        </motion.header>
        <motion.div layout className="content-buttons">
          <AnimatePresence initial={false}>
            {
              onlineStatus && (
                <motion.div
                  key="protocol-url"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ width: '100%', height: '100%' }}
                  layout
                >
                  <GraphicButton
                    color="sea-green"
                    onClick={toggleShowProtocolUrlForm}
                  >
                    <h3>Import</h3>
                    <h2>From URL</h2>
                  </GraphicButton>
                </motion.div>
              )
            }
            <motion.div
              key="protocol-file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
              layout
            >
              <GraphicButton
                color="slate-blue--dark"
                onClick={importLocalProtocol}
              >
                <h3>Import</h3>
                <h2>From File</h2>
              </GraphicButton>
            </motion.div>
            {
              onlineStatus && pairedServerConnection === 'ok' && (
                <motion.div
                  key="protocol-server"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ width: '100%', height: '100%' }}
                  layout
                >
                  <GraphicButton
                    color="mustard"
                  >
                    <h3>Import</h3>
                    <h2>From Server</h2>
                  </GraphicButton>
                </motion.div>
              )
            }
          </AnimatePresence>
        </motion.div>
      </motion.main>
      { Object.keys(installedProtocols).length > 0 && (
        <motion.footer layout className="import-section__manage-protocols">
          <Button color="platinum">Manage Installed Protocols...</Button>
        </motion.footer>
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
