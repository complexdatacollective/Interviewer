import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { entityAttributesProperty } from '@codaco/shared-consts';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { importProtocolFromURI } from '../../utils/protocol/importProtocol';
import NewFilterableListWrapper from '../../components/NewFilterableListWrapper';
import { Overlay } from '../Overlay';
import ApiClient from '../../utils/ApiClient';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { ProtocolCard } from '../../components/Cards';

const FetchServerProtocolPicker = ({
  show,
  onClose,
}) => {
  const handleProtocolCardClick = (downloadPath) => {
    importProtocolFromURI(downloadPath, true);
    onClose();
  };

  const onlineStatus = useOnlineStatus();

  const dispatch = useDispatch();
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));
  const pairedServer = useSelector((state) => state.pairedServer);

  const [protocolList, setProtocolList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleApiError = (error) => {
    const errorObject = new Error(error);
    errorObject.friendlyMessage = 'There was an error fetching the protocol list from Server. Consult the error message below for further information. Contact the Network Canvas project team for help with this error.';
    openDialog({
      type: 'Error',
      title: 'Error fetching protocol list from Server',
      error: errorObject,
      confirmLabel: 'Okay',
      onConfirm: () => {
        setLoading(false);
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!show) return;

    if (!onlineStatus || !pairedServer) { onClose(); }

    setLoading(true);

    const apiClient = new ApiClient(pairedServer);

    apiClient
      .addTrustedCert()
      .then(() => apiClient.getProtocols())
      .then((protocols) => {
        setProtocolList(protocols);
        setLoading(false);
      })
      .catch((err) => handleApiError(err));
  }, [show, pairedServer, onlineStatus]);

  const formattedProtocols = [...Object.keys(protocolList)].map((protocolUID) => {
    const {
      schemaVersion,
      lastModified,
      name,
      description,
      downloadPath,
    } = protocolList[protocolUID];

    return {
      [entityAttributesProperty]: {
        schemaVersion,
        lastModified,
        name,
        description,
      },
      onClickHandler: () => handleProtocolCardClick(downloadPath),
    };
  });

  return (
    <Overlay
      show={show}
      onClose={onClose}
      title="Select a Protocol to Import"
      fullheight
    >
      <NewFilterableListWrapper
        ItemComponent={ProtocolCard}
        loading={loading}
        items={formattedProtocols}
        propertyPath="attributes"
        initialSortProperty="name"
        initialSortDirection="asc"
        sortableProperties={[
          {
            label: 'Name',
            variable: 'name',
          },
          {
            label: 'Modified',
            variable: 'lastModified',
          },
        ]}
      />
    </Overlay>
  );
};

export default FetchServerProtocolPicker;
