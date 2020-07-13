import React, {useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import { bindActionCreators } from 'redux';
import useInterval from '../../hooks/useInterval';
import ServerDiscoverer from '../../utils/serverDiscoverer';
import ServerIcon from './ServerIcon';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as pairingStatusActions } from '../../ducks/modules/pairingStatus';
import { ProgressBar } from '../../components';
import PairingOverlay from './PairingOverlay';
import ServerProtocolsOverlay from './ServerProtocolsOverlay';
import { PairedServerCard } from '../../components/SetupScreen';

const ServerStatusToast = (props) => {
  const {
    id,
    title,
    message,
    displayDuration,
    onTimeout,
    onClickHandler,
  } = props;

  const [hovering, setHovering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(displayDuration);

  useInterval(() => {
    if (hovering) { return; }
    setTimeRemaining(timeRemaining - 1000);
  }, 1000);

  if (timeRemaining === 0) { onTimeout(); }

  return (
    <motion.li
      key={id}
      positionTransition
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="server-status-toast"
      onPointerOver={() => setHovering(true)}
      onPointerOut={() => setHovering(false)}
      whileHover={{ scale: 1.1 }}
      onClick={() => onClickHandler()}
    >
      <aside className="server-status-toast__icon">
        <Icon name="info" />
      </aside>
      <main className="server-status-toast__content">
        <h4>{title}</h4>
        <p>{message}</p>
        <ProgressBar percentProgress={(timeRemaining / displayDuration * 100)} orientation="horizontal" />
      </main>
    </motion.li>
  );
};

const remove = (array, name) => array.filter(item => (item.data.name !== name));

const createNotification = (
  title,
  message,
  type,
  data,
  displayDuration,
  handleClick,
) => {
  const id = uuidv4();

  return {
    id,
    title,
    message,
    type,
    data,
    displayDuration,
    handleClick,
  };
};

const ServerStatusIcon = (props) => {
  const {
    pairedServer,
    pairingStatus,
    showPairingOverlay,
    showServerProtocolsOverlay,
    updatePairingStatus,
    openDialog,
  } = props;

  const [notifications, setNotifications] = useState([]);
  const [showStatusPanel, setShowStatusPanel] = useState(false);

  const [serverDiscovererErrorState, setServerDiscovererErrorState] = useState(null)

  const classes = cx({
    'server-status': true,
    'server-status--paired': !!pairedServer,
    'server-status--error': pairingStatus.error || serverDiscovererErrorState,
  });

  // Check for change in ability to contact server, repeat every 60 seconds.

  useInterval(() => {
    updatePairingStatus();
  }, 1000 * 60);

  useEffect(() => {
    if (pairedServer) {
      updatePairingStatus();
    } else {
      try {
        const serverDiscoverer = new ServerDiscoverer();
        console.log(serverDiscoverer);
        if (!serverDiscoverer) { return; }

        serverDiscoverer.on('SERVER_RESET', () => {
          setServerDiscovererErrorState(null);
        });

        serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
          if (!response.name) { return; }

          // Detect if we already have a service with this name
          const existingIndex =
            notifications.findIndex(notification => response.name === notification.data.name);

          if (existingIndex === -1) {

            const newNotification = createNotification(
              `${response.name} became available!`,
              'Click to begin pairing with this computer running Server.',
              'SERVER_ANNOUNCED',
              response,
              5000,
              () => console.log('clicked'),
            );

            setNotifications([...notifications, newNotification]);
          }
        });

        serverDiscoverer.on('SERVER_REMOVED', (response) => {
          setNotifications(remove(notifications, response.name));
        });

        serverDiscoverer.on('SERVER_ERROR', (e) => {
          setServerDiscovererErrorState({ e });
        });

        serverDiscoverer.init();
      } catch (e) {
        setServerDiscovererErrorState({ e });
      }
    }
  }, []);

  // Click icon action based on state:
  // - Paired: show protocol list overlay
  // - Paired but can't connect to server: show dialog with error and ask if you want to unpair.
  // - Error: show error dialog
  // - Searching: pairingoverlay
  const handleIconClick = () => {
    if (pairedServer) {
      if (pairingStatus.error) {
        console.log('here');
        openDialog({
          type: 'Notice',
          title: 'Could not Communicate with Server',
          confirmLabel: 'Unpair Server',
          onConfirm: () => console.log('confirmed'),
          message: (
            <React.Fragment>
              <p>
                There was an error connecting to the Server this device is paired with. the specific
                error encountered was:
              </p>
              <pre>
                { pairingStatus.error.message }
              </pre>
              <p>
                If you are unable to resolve this error, you should un-pair from Server
                and attempt to pair again.
              </p>
              <PairedServerCard />
            </React.Fragment>
          ),
        });

        return;
      }

      showServerProtocolsOverlay();
    } else {
      showPairingOverlay();
    }
  };


  // Hover panel content based on state:
  // - Paired: show protocol list with one click download
  // - Paired but can't connect to server: show dialog with error and ask if you want to unpair.
  // - MDNS Error : "show error icon"
  // - Searching: show click to pair instructions
  const renderStatusPanel = () => {
    if (pairedServer) {
      if (pairingStatus.error) {
        return (
          <div className="server-status__status">
            <h4>Error communicating with Server</h4>
            <p>
              This device is paired, but it could not communicate with Server. Click
              to view a description of the error, and optionally un-pair.
            </p>
          </div>
        );
      }

      return (
        <div className="server-status__status">
          <h4>Paired with {pairedServer.name || pairedServer.addresses[0]}</h4>
          <p>
            This device is paired. Export options are enabled. Click to view and
            install interview protocols.
          </p>
        </div>
      );
    }

    // We haven't paired yet.

    // There is an error with MDNS
    if (serverDiscovererErrorState) {
      return (
        <div className="server-status__status">
          <h4>Ready to pair with manual connection details.</h4>
          <p>
            This device is not paired with a computer running Server. Automatic Server discovery
            is unavailable, but you can still pair using manual connection details. Click this
            icon to begin pairing.
          </p>
          <p>
            Automatic Server Discovery: <strong>unavailable</strong>
          </p>
        </div>
      );
    }

    // Ready to pair
    return (
      <div className="server-status__status">
        <h4>Ready to pair.</h4>
        <p>
          This device is not paired with a computer running Server, but is ready
          to begin the process. Click this icon to begin pairing.
        </p>
        <p>
          Automatic Server Discovery: <strong>enabled</strong>
        </p>
      </div>
    );
  };

  return (
    <React.Fragment>
      <PairingOverlay />
      <ServerProtocolsOverlay />
      <div className={classes}>
        <div
          onPointerOver={() => setShowStatusPanel(true)}
          onPointerOut={() => setShowStatusPanel(false)}
          onClick={() => handleIconClick()}
        >
          <ServerIcon />
        </div>
        { (showStatusPanel && notifications.length === 0) && renderStatusPanel()}

        <ul className="server-notification-list">
          <AnimatePresence initial={false}>
            {notifications.map(notification => (
              <ServerStatusToast
                key={notification.data.name}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClickHandler={() => notification.handleClick(notification.id)}
                onTimeout={() => setNotifications(remove(notifications, notification.data.name))}
                displayDuration={notification.displayDuration}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </React.Fragment>
  );
};

ServerStatusIcon.defaultProps = {
  pairedServer: null,
};

ServerStatusIcon.propTypes = {
  pairedServer: PropTypes.object,

};

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
  pairingStatus: state.pairingStatus,
});


const mapDispatchToProps = dispatch => ({
  showPairingOverlay: () =>
    dispatch(uiActions.update({ showPairingOverlay: true })),
  showServerProtocolsOverlay: () =>
    dispatch(uiActions.update({ showServerProtocolsOverlay: true })),
  updatePairingStatus: () => dispatch(pairingStatusActions.updatePairingStatus()),
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServerStatusIcon);
