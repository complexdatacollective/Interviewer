import React from 'react';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui/lib/components';
import { actionCreators as importProtocolActions } from '../../../ducks/modules/importProtocol';
import { actionCreators as mockActions } from '../../../ducks/modules/mock';
import { getAdditionalAttributesForCurrentPrompt, getNodeEntryForCurrentPrompt } from '../../../selectors/session';
import { DEVELOPMENT_PROTOCOL_URL } from '../../../config';
import TabItemVariants from './TabItemVariants';

const DeveloperTools = (props) => {
  const {
    handleResetAppData,
    handleAddMockNodes,
    shouldShowMocksItem,
    importProtocolFromURI,
  } = props;

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element">
        <div className="form-field-container">
          <div className="form-field">
            <Button
              id="reset-all-nc-data"
              color="neon-coral"
              onClick={handleResetAppData}
            >
              Reset data
            </Button>
          </div>
        </div>
        <div>
          <h2>Reset All App Data</h2>
          <p>
            Click the button above to reset all Network Canvas data. This will erase any
            in-progress interviews, and all application settings.
          </p>
        </div>
      </motion.article>
      {
        shouldShowMocksItem &&
        <motion.article variants={TabItemVariants} className="settings-element">
          <div className="form-field-container">
            <div className="form-field">
              <Button
                color="mustard"
                onClick={handleAddMockNodes}
              >
                Add nodes
              </Button>
            </div>
          </div>
          <div>
            <h2>Add Mock Nodes</h2>
            <p>
              During an active interview session, clicking this button will create
              mock nodes for testing purposes.
            </p>
          </div>
        </motion.article>
      }
      <motion.article variants={TabItemVariants} className="settings-element">
        <div className="form-field-container">
          <div className="form-field">
            <Button
              color="mustard"
              onClick={() => importProtocolFromURI(DEVELOPMENT_PROTOCOL_URL)}
            >
              Import
            </Button>
          </div>
        </div>
        <div>
          <h2>Import Development Protocol</h2>
          <p>
            Clicking this button will import the latest development protocol for this
            version of Network Canvas.
          </p>
        </div>
      </motion.article>
    </React.Fragment>
  );
};

const developerToolsHandlers = withHandlers({
  handleAddMockNodes: props => () => {
    if (!props.nodeVariableEntry) {
      return;
    }
    const [typeKey, nodeDefinition] = props.nodeVariableEntry;
    props.generateNodes(nodeDefinition.variables, typeKey, 20, props.additionalMockAttributes);
    props.closeMenu();
  },
});

const mapDispatchToProps = dispatch => ({
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
  importProtocolFromURI:
    bindActionCreators(importProtocolActions.importProtocolFromURI, dispatch),
});

const mapStateToProps = state => ({
  protocol: state.importProtocol,
  nodeVariableEntry: getNodeEntryForCurrentPrompt(state),
  shouldShowMocksItem: !!getNodeEntryForCurrentPrompt(state),
  additionalMockAttributes: getAdditionalAttributesForCurrentPrompt(state),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  developerToolsHandlers,
)(DeveloperTools);
