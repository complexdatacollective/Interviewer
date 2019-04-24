import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { Button } from '../../ui/components';
import logo from '../../images/Srv-Flat.svg';

const noClick = () => {};

/**
 * Renders a server icon & label. The label defaults to server name, falling back
 * to its first address (both provided via the `data` prop). If `secondaryLabel`
 * is provided, then it will be appended.
 */
const ServerCard = ({
  data,
  secondaryLabel,
  selectServer,
  isPaired,
  className,
  openDialog,
  unpairServer,
}) => {
  const cssClass = classNames(
    'server-card',
    { 'server-card--paired': isPaired },
    { 'server-card--clickable': selectServer !== noClick },
    className,
  );
  const { name, addresses = [] } = data;
  let label = name || addresses[0];
  if (secondaryLabel) {
    label += ` ${secondaryLabel}`;
  }

  const handleUnpairRequest = () => {
    openDialog({
      type: 'Warning',
      title: 'Unpair this Server?',
      confirmLabel: 'Unpair Server',
      onConfirm: unpairServer,
      message: 'This will remove the connection to this instance of Server. Are you sure you want to continue?',
    });
  };

  return (
    <div className={cssClass} onClick={() => selectServer(data)} >
      <img src={logo} className="server-card__icon" alt="Available Server" />
      <h4 className="server-card__label">
        {label}
      </h4>
      {isPaired &&
      <Button size="small" color="mustard" onClick={handleUnpairRequest}>Unpair</Button>
      }
    </div>
  );
};

ServerCard.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    addresses: PropTypes.array,
  }),
  className: PropTypes.string,
  isPaired: PropTypes.bool,
  selectServer: PropTypes.func,
  secondaryLabel: PropTypes.string,
  unpairServer: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
};

ServerCard.defaultProps = {
  data: {},
  className: '',
  isPaired: false,
  selectServer: noClick,
  secondaryLabel: null,
};

function mapDispatchToProps(dispatch) {
  return {
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ServerCard);
