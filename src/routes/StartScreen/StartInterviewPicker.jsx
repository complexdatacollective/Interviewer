import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProtocolCard from '../../components/Cards/ProtocolCard';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import NewFilterableListWrapper from '../../components/NewFilterableListWrapper';
import NewSessionOverlay from './NewSessionOverlay';
import { Overlay } from '../../containers/Overlay';

const StartInterviewPicker = ({
  show,
  onClose,
  addSession,
  installedProtocols,
}) => {
  const [showNewSessionOverlay, setShowNewSessionOverlay] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const handleCloseNewSessionOverlay = () => {
    setShowNewSessionOverlay(false);
    setSelectedProtocol(null);
  };

  const handleCreateSession = (caseId) => {
    addSession(caseId, selectedProtocol);
    handleCloseNewSessionOverlay();
    onClose();
  };

  const handleProtocolCardClick = (protocolUID) => {
    setShowNewSessionOverlay(true);
    setSelectedProtocol(protocolUID);
  };

  const formattedProtocols = [...Object.keys(installedProtocols)].map((protocolUID) => {
    const {
      schemaVersion,
      lastModified,
      installationDate,
      name,
      description,
    } = installedProtocols[protocolUID];

    return {
      attributes: {
        schemaVersion,
        lastModified,
        installationDate,
        name,
        description,
      },
      onClickHandler: () => handleProtocolCardClick(protocolUID),
    };
  });

  return (
    <Overlay
      show={show}
      onClose={onClose}
      title="Select a Protocol"
      fullheight
    >
      <NewFilterableListWrapper
        ItemComponent={ProtocolCard}
        items={formattedProtocols}
        propertyPath={null}
        initialSortProperty="name"
        initialSortDirection="asc"
        sortableProperties={[
          {
            label: 'Name',
            variable: 'name',
          },
          {
            label: 'Installed',
            variable: 'installationDate',
          },
          {
            label: 'Modified',
            variable: 'lastModified',
          },
        ]}
      />
      <NewSessionOverlay
        handleSubmit={handleCreateSession}
        onClose={handleCloseNewSessionOverlay}
        show={showNewSessionOverlay}
      />
    </Overlay>
  );
};

StartInterviewPicker.propTypes = {
  installedProtocols: PropTypes.object.isRequired,
  addSession: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
  };
}

const mapDispatchToProps = (dispatch) => ({
  addSession: (caseId, protocol) => dispatch(sessionsActions.addSession(caseId, protocol)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StartInterviewPicker);
