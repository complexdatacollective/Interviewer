import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, Spinner, Scroller } from '@codaco/ui';
import { ServerCard as UIServerCard } from '@codaco/ui/lib/components/Cards';
import ServerDiscoverer from '../../utils/serverDiscoverer';
import { AnimatePresence } from 'framer-motion';


const ServerCard = (props) => {
  const {
    data
  } = props;

  const {
    name,
    addresses
  } = data;

  const onClickLoadSession = (event) => {
    event.preventDefault();
    setSession(sessionUUID);
  };

  return (
    <UIServerCard
      caseId={caseId}
      startedAt={startedAt}
      updatedAt={updatedAt}
      protocolName={protocol.name}
      progress={progress}
      onClickHandler={onClickLoadSession}
    />
  );
};

/**
 * Displays a list of available servers discovered via MDNS.
 */
const DiscoveredServerList = () => {
  const [serverList, updateServerList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const serverDiscoverer = new ServerDiscoverer();

    // Bind events
    serverDiscoverer.on('SERVER_RESET', () => {
      setError(null);
    });

    serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      if (!response.name) { return; }

      const servers = serverList.slice();
      // Detect if we already have a service with this name
      const serverIndex = serverList.findIndex(server => response.name === server.name);
      if (serverIndex === -1) {
        servers.push(response);
      } else {
        servers[serverIndex] = response;
      }
      updateServerList(servers);
    });

    serverDiscoverer.on('SERVER_REMOVED', (response) => {
      this.setState(prevState => ({
        servers: prevState.servers.filter(item => (item.name !== response.name)),
      }));
    });

    serverDiscoverer.on('SERVER_ERROR', (error) => {
      console.log('server_error', error);
      setError(error);
    });

    serverDiscoverer.init();

    return () => {
      serverDiscoverer.removeAllListeners();
    };
  }, []);


  if (error) {
    console.log('error', error);
    return (
      <div className="discovered-server-list">
        <div className="server-list--error">
          <div className="error__icon">
            <Icon name="error" />
          </div>
          <div className="error__description">
            <h4>Automatic server discovery unavailable</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (serverList.length > 0) {
    return (
      <div className="discovered-server-list">
        <Scroller className="discovered-server-list__content">
          <AnimatePresence>
            {
              serverList.map(server => (
                <ServerCard
                  key={server.pairingServiceUrl}
                  data={server}
                  selectServer={selectServer}
                />
              ))
            }
          </AnimatePresence>
        </Scroller>
      </div>
    );
  }

  return (
    <div className="discovered-server-list">
      <div className="server-list--placeholder">
        <h4>Listening for nearby Servers...</h4>
        <Spinner small />
      </div>
    </div>
  );
}

DiscoveredServerList.defaultProps = {
};

DiscoveredServerList.propTypes = {
};

export default DiscoveredServerList;
