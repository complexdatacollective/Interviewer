import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { ServerCard as UIServerCard } from '@codaco/ui/lib/components/Cards';
import { Icon, Spinner, Scroller, Button } from '@codaco/ui';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import ServerDiscoverer from '../../utils/serverDiscoverer';

const ServerCard = (props) => {
  const {
    name,
    host,
    addresses,
    pairingServiceUrl,
  } = props;

  const handleServerCardClick = () => {
    console.log('start pairing with ', pairingServiceUrl);
  };

  return (
    <motion.div
      enter={{ scale: 1 }}
      exit={{ scale: 0 }}
      layout
    >
      <UIServerCard
        name={name}
        host={host}
        addresses={addresses}
        onClickHandler={handleServerCardClick}
      />
    </motion.div>
  );
};

/**
 * Displays a list of available servers discovered via MDNS.
 */
const DiscoveredServerList = ({
  openDialog,
}) => {
  const onlineStatus = useOnlineStatus();
  const [serverList, updateServerList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // When online status changes, useEffect is called. Reset any previous errors
    setError(null);

    const serverDiscoverer = new ServerDiscoverer();

    // Bind events
    serverDiscoverer.on('SERVER_RESET', () => {
      setError(null);
    });

    serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      if (!response.name) { return; }
      updateServerList((prevState) => {
        // Detect if we already have a service with this name
        const serverIndex = prevState.findIndex(server => response.name === server.name);

        if (serverIndex !== -1) {
          const newArray = [...prevState];
          newArray[serverIndex] = response;
          return newArray;
        }

        return [...prevState, response];
      });
    });

    serverDiscoverer.on('SERVER_REMOVED', (response) => {
      updateServerList(prevState => prevState.filter(item => (item.name !== response.name)));
    });

    serverDiscoverer.on('SERVER_ERROR', (serverError) => {
      setError(serverError);
    });

    serverDiscoverer.init();

    return () => {
      serverDiscoverer.removeAllListeners();
    };
  }, [onlineStatus]);

  const showErrorDialog = () => {
    const errorObject = new Error(error);
    errorObject.friendlyMessage = 'The automatic Server discovery feature could not be used. Consult the error message below for further information. Contact the Network Canvas project team for help with this error.';
    openDialog({
      type: 'Error',
      title: 'Automatic Server discovery unavailable',
      error: errorObject,
      confirmLabel: 'Okay',
    });
  };

  if (!onlineStatus) {
    return (
      <div className="discovered-server-list discovered-server-list--offline">
        <div className="server-list server-list--offline">
          <div className="error__icon">
            <Icon name="info" />
          </div>
          <div className="error__description">
            <h4>You don&apos;t seem to have a network connection.</h4>
            <p>
              Pairing with Server, fetching protocols from Server, and uploading data, all
              require an active network connection. Check your device is connected to your
              network, and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="discovered-server-list discovered-server-list--error">
        <div className="server-list server-list--error">
          <div className="error__icon">
            <Icon name="error" />
          </div>
          <div className="error__description">
            <h4>We couldn&apos;t enable automatic discovery.</h4>
            <p>
              There was a problem enabling the automatic Server discovery
              feature of Network Canvas. You can still pair with your computer
              running Server by entering manual connection details using the
              button below.
            </p>
            <Button size="small" onClick={showErrorDialog} color="neon-coral">Show error details</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="discovered-server-list">
      <header>
        <Spinner small /><h4>Looking for nearby Servers...</h4>
      </header>
      <Scroller className="discovered-server-list__content">
        <AnimatePresence>
          {
            serverList.map(server => (
              <ServerCard
                key={server.pairingServiceUrl}
                {...server}
              />
            ))
          }
        </AnimatePresence>
      </Scroller>
    </div>
  );
};

DiscoveredServerList.defaultProps = {
};

DiscoveredServerList.propTypes = {
};

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
};

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoveredServerList);

