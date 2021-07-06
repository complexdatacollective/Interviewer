import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@codaco/ui/lib/components/Button';
import { actionCreators as installedProtocolActions } from '../../ducks/modules/installedProtocols';
import { ProtocolCard } from '../../components/Cards';
import { entityAttributesProperty } from '../../ducks/modules/network';
import Picker from '../../components/Picker';

const ManageProtocolsOverlay = ({
  show,
  onClose,
  installedProtocols,
  deleteProtocol,
}) => {
  const formattedProtocols = [...Object.keys(installedProtocols)].map((protocolUID) => {
    const {
      schemaVersion,
      lastModified,
      installationDate,
      name,
      description,
    } = installedProtocols[protocolUID];

    return {
      [entityAttributesProperty]: {
        schemaVersion,
        lastModified,
        installationDate,
        name,
        description,
      },
      meta: () => ({ protocolUID }),
    };
  });

  // dropHandler={({ protocolUID }) => deleteProtocol(protocolUID)}

  return (
    <Picker
      show={show}
      onClose={onClose}
      title="Select Protocols to Delete"
      header={(
        <p>
          These are the protocols that are currently installed on this device. To
          delete a protocol, drag it with your mouse or finger into the bin that
          will appear at the bottom of the screen.
        </p>
      )}
      footer={(
        <Button color="neon-coral" icon="menu-purge-data">Delete Selected</Button>
      )}
      ItemComponent={ProtocolCard}
      items={formattedProtocols}
      propertyPath={entityAttributesProperty}
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
  );
};

ManageProtocolsOverlay.propTypes = {
  installedProtocols: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
  };
}

const mapDispatchToProps = {
  deleteProtocol: installedProtocolActions.deleteProtocol,
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageProtocolsOverlay);
