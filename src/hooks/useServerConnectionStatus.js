import { useState, useEffect } from 'react';
import useInterval from './useInterval';
import ApiClient from '../utils/ApiClient';
import useOnlineStatus from './useOnlineStatus';

function getServerConnectionStatus(apiClient) {
  return apiClient.requestHeartbeat()
    .then(() => 'ok')
    .catch((e) => {
      if (e.status === 'version_mismatch') { return e.status; }
      return 'error';
    });
}

const useServerConnectionStatus = (pairedServer) => {
  const apiClient = new ApiClient(pairedServer);

  const onlineStatus = useOnlineStatus();
  const [connectionStatus, setConnectionStatus] = useState('waiting');

  /**
   * Call the heartbeat API when the onlineStatus or the pairedServer
   * changes.
   */
  useEffect(() => {
    if (!pairedServer) {
      setConnectionStatus('waiting');
      return;
    }

    apiClient.addTrustedCert().then(() => {
      getServerConnectionStatus(apiClient)
        .then((response) => {
          setConnectionStatus(response);
        });
    }).catch(() => setConnectionStatus('error'));
  }, [onlineStatus, pairedServer]);

  /**
   * Re-check connection status at an interval based on if the previous
   * attempt succeeded:
   *  - succeeded -> check again in 30 seconds
   *  - failed -> check again in 5 seconds
   */
  const checkInterval = onlineStatus ? 30000 : 5000;
  useInterval(() => {
    if (!pairedServer) {
      setConnectionStatus('waiting');
      return;
    }

    getServerConnectionStatus(apiClient)
      .then((response) => {
        setConnectionStatus(response);
      });
  }, checkInterval);

  return connectionStatus;
};

export default useServerConnectionStatus;
