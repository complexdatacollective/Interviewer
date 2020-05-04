import React, {useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import useInterval from '../../hooks/useInterval';
import ServerDiscoverer from '../../utils/serverDiscoverer';
import ServerIcon from './ServerIcon';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { ProgressBar } from '../../components';
import uuidv4 from '../../utils/uuid';
import PairingOverlay from './PairingOverlay';

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

const ServerStatusIcon = (props) => {
  const {
    pairedServer,
    showPairingOverlay,
  } = props;

  const [notifications, setNotifications] = useState([]);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [error, setErrorState] = useState(null);

  const classes = cx({
    'server-status': true,
    'server-status--error': error,
    'server-status--paired': !!pairedServer,
  });

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

  useEffect(() => {
    try {
      const serverDiscoverer = new ServerDiscoverer();
      console.log(serverDiscoverer);
      if (!serverDiscoverer) { return; }

      serverDiscoverer.on('SERVER_RESET', () => {
        setErrorState(null);
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
        setErrorState({ e });
      });

      serverDiscoverer.init();
    } catch (e) {
      setErrorState({ e });
    }
  }, []);


  // Click icon action based on state:
  // - Paired: show protocol list overlay
  // - Error: show error dialog
  // - Searching: pairingoverlay
  const handleIconClick = () => {
    showPairingOverlay();
  };


  // Hover panel content based on state:
  // - Paired: show protocol list with one click download
  // - Error: show error
  // - Searching: show click to pair instructions
  const renderStatusPanel = () => {
    if (pairedServer) {
      return (
        <div className="server-status__status">
          <h4>Paired with {pairedServer.name}</h4>
          <p>
            This device is paired. Export options are enabled. Click to view and
            install interview protocols.
          </p>
        </div>
      );
    }

    return (
      <div className="server-status__status">
        <h4>Ready to pair.</h4>
        <p>
          This device is not paired with a computer running Server, but is ready
          to begin the process.
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
});


const mapDispatchToProps = dispatch => ({
  showPairingOverlay: () =>
    dispatch(uiActions.update({ showPairingOverlay: true })),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServerStatusIcon);
