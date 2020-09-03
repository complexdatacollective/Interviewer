import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import { NewFilterableListWrapper } from '../../components';
import { Overlay } from '../Overlay';
import ApiClient from '../../utils/ApiClient';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { ProtocolCard } from '../../components/Cards';

const FetchServerProtocolPicker = ({
  show,
  onClose,
  pairedServer,
  openDialog,
  importProtocolFromURI,
}) => {
  const handleProtocolCardClick = (downloadPath) => {
    importProtocolFromURI(downloadPath, true);
  };

  const onlineStatus = useOnlineStatus();

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
    if (!show) { return; }

    if (!onlineStatus || !pairedServer) { onClose(); return; }

    setLoading(true);

    const apiClient = new ApiClient(pairedServer);

    apiClient
      .addTrustedCert()
      .then(() => apiClient.getProtocols())
      .then((protocols) => {
        setProtocolList(protocols);
        setLoading(false);
      })
      .catch(err => handleApiError(err));
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

function mapStateToProps(state) {
  return {
    pairedServer: state.pairedServer,
  };
}

const mapDispatchToProps = dispatch => ({
  addSession: (caseId, protocol) => dispatch(sessionsActions.addSession(caseId, protocol)),
  openDialog: dialog => dispatch(dialogActions.openDialog(dialog)),
  importProtocolFromURI: uri => dispatch(protocolActions.importProtocolFromURI(uri, true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FetchServerProtocolPicker);
