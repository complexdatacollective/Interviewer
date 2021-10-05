import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { Button } from '@codaco/ui';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import Section from './Section';
import DiscoveredServerList from '../Server/DiscoveredServerList';
import ServerAddressForm from './ServerAddressForm';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { ServerCard } from '../../components/Cards';
import { openExternalLink } from '../../components/ExternalLink';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';

const ServerSection = () => {
  const pairedServer = useSelector((state) => state.pairedServer);

  const [selectedServer, setSelectedServer] = useState(null);
  const [showServerAddressForm, setShowServerAddressForm] = useState(false);

  const onlineStatus = useOnlineStatus();
  const pairedServerConnection = useServerConnectionStatus(pairedServer);

  const dispatch = useDispatch();
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));
  const unpairServer = () => dispatch(serverActions.unpairServer());

  const handleUnpairRequest = () => {
    openDialog({
      type: 'Warning',
      title: 'Unpair from Server?',
      confirmLabel: 'Unpair',
      onConfirm: unpairServer,
      message: (
        <p>
          This will remove the connection to your computer running Server. You
          will not be able to upload data or fetch protocols. Are you sure you want to continue?
        </p>
      ),
    });
  };

  const renderServerStatus = () => {
    if (!onlineStatus) {
      return (
        <p>
          Your device does not appear to have an active network connection so
          it cannot communicate with Server. Fetching protocols and uploading
          data are unavailable. Connect to a network, and try again.
        </p>
      );
    }

    if (pairedServerConnection === 'version_mismatch') {
      return (
        <>
          <p>
            This device could not communicate with your paired Server because
            of a version mismatch. You may need to update your software on the
            device or the server. Fetching protocols and uploading data have
            been disabled. Use the button below for more troubleshooting information.
          </p>
          <Button size="small" color="neon-coral" onClick={() => openExternalLink('https://documentation.networkcanvas.com/how-to/pairing/#troubleshooting')}>More Information</Button>
        </>
      );
    }

    if (pairedServerConnection !== 'ok' && pairedServerConnection !== 'version_mismatch') {
      return (
        <>
          <p>
            This device could not communicate with your paired Server. Fetching
            protocols and uploading data have been disabled. Check Server is
            open on your remote computer, and that your network is configured
            correctly. Use the button below for more troubleshooting information.
          </p>
          <Button size="small" color="neon-coral" onClick={() => openExternalLink('https://documentation.networkcanvas.com/how-to/pairing/#troubleshooting')}>More Information</Button>
        </>
      );
    }

    return (
      <p>Connection to Server established. Data upload and protocol fetching are available.</p>
    );
  };

  const serverStatusClasses = cx(
    'server-status',
    { 'server-status--caution': !onlineStatus },
    { 'server-status--error': pairedServerConnection !== 'ok' },
    { 'server-status--ok': onlineStatus && pairedServerConnection === 'ok' },
  );

  return (
    <Section className="start-screen-section server-section">
      <main className="server-section__main">
        <div className="content-area">
          <div className="content-area__discover">
            <header>
              <h2>Server Status</h2>
            </header>
            { !pairedServer ? (
              <>
                <p>
                  To begin, open Server on a computer connected to the same network as this device.
                  When the device appears below, click its card to start the pairing process.
                </p>
                <DiscoveredServerList onSelectServer={(server) => {
                  setSelectedServer(server);
                  setShowServerAddressForm(true);
                }}
                />
              </>
            ) : (
              <div className="paired-server-wrapper">
                <ServerCard
                  name={pairedServer.name}
                  host={pairedServer.host}
                  addresses={pairedServer.addresses}
                  disabled={!onlineStatus || pairedServerConnection !== 'ok'}
                />
                <div className={serverStatusClasses}>
                  <div className="server-status__indicator">
                    <div className="indicator" />
                  </div>
                  <div className="server-status__text">
                    { renderServerStatus() }
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="content-area__buttons">
            <Button color="mustard--dark" disabled={!onlineStatus} onClick={() => openExternalLink('https://documentation.networkcanvas.com/key-concepts/pairing')}>View Pairing Documentation</Button>
            { !pairedServer ? (
              <Button disabled={!onlineStatus} color="platinum" onClick={() => setShowServerAddressForm(true)}>Provide manual connection details...</Button>
            )
              : (<Button color="platinum" onClick={handleUnpairRequest}>Unpair</Button>)}
          </div>
        </div>
        <ServerAddressForm
          key={selectedServer}
          server={selectedServer}
          show={showServerAddressForm}
          handleClose={() => { setShowServerAddressForm(false); setSelectedServer(null); }}
        />
      </main>
    </Section>
  );
};

export default ServerSection;
