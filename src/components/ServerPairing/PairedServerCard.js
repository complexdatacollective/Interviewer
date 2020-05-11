import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';

/**
 * Renders a server icon & label. The label defaults to server name, falling back
 * to its first address (both provided via the `data` prop). If `secondaryLabel`
 * is provided, then it will be appended.
 */
const PairedServerCard = ({
  pairedServer,
  openDialog,
  unpairServer,
  handleUnpair,
}) => {

  const handleUnpairRequest = () => {
    openDialog({
      type: 'Warning',
      title: 'Unpair from Server?',
      confirmLabel: 'Unpair Server',
      onConfirm: () => { handleUnpair(); unpairServer(); },
      message: 'This will remove the ability to import or export data to this Server. Are you sure you want to continue?',
    });
  };

  return (
    <div className="paired-server-card">
      <p>Currently paired with <strong>{pairedServer.name || pairedServer.addresses[0]}</strong></p>
      <Button color="mustard" onClick={handleUnpairRequest}>Unpair</Button>
    </div>
  );
};

PairedServerCard.propTypes = {
  unpairServer: PropTypes.func.isRequired,
  handleUnpair: PropTypes.func,
  openDialog: PropTypes.func.isRequired,
};

PairedServerCard.defaultProps = {
  handleUnpair: () => {},
  className: '',
};

function mapDispatchToProps(dispatch) {
  return {
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
});

export { PairedServerCard as UnconnectedServerCard };

export default connect(mapStateToProps, mapDispatchToProps)(PairedServerCard);
