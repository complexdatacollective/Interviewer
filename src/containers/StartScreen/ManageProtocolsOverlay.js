import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@codaco/ui/lib/components/Button';
import { entityAttributesProperty } from '@codaco/shared-consts';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as installedProtocolActions } from '../../ducks/modules/installedProtocols';
import { ProtocolCard } from '../../components/Cards';
import Picker from '../../components/Picker';

const ManageProtocolsOverlay = ({
  show,
  onClose,
}) => {
  const [selectedProtocols, setSelectedProtocols] = useState([]);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const formattedProtocols = () => [...Object.keys(installedProtocols)].map((protocolUID) => {
    const {
      schemaVersion,
      lastModified,
      installationDate,
      name,
      description,
    } = installedProtocols[protocolUID];

    return {
      uid: protocolUID,
      key: protocolUID,
      selected: selectedProtocols.includes(protocolUID),
      [entityAttributesProperty]: {
        schemaVersion,
        lastModified,
        installationDate,
        name,
        description,
      },
    };
  });

  const dispatch = useDispatch();
  const deleteProtocol = (id) => dispatch(installedProtocolActions.deleteProtocol(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const handleDeleteProtocols = () => {
    openDialog({
      type: 'Warning',
      title: `Delete ${selectedProtocols.length} Interview Protocol${selectedProtocols.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Permanently Delete',
      onConfirm: async () => {
        // eslint-disable-next-line no-restricted-syntax
        for (const protocol of selectedProtocols) {
          // eslint-disable-next-line no-await-in-loop
          await deleteProtocol(protocol);
        }

        setSelectedProtocols([]);
      },
      message: (
        <p>
          This action will delete the selected protocols and cannot be undone.
          Are you sure you want to continue?
        </p>
      ),
    });
  };

  const handleProtocolCardClick = (protocolUUID) => {
    if (selectedProtocols.includes(protocolUUID)) {
      setSelectedProtocols([
        ...selectedProtocols.filter((protocol) => protocol !== protocolUUID),
      ]);

      return;
    }

    setSelectedProtocols((alreadySelected) => [
      ...alreadySelected,
      protocolUUID,
    ]);
  };

  const SelectableProtocolCard = ({ uid, ...props }) => (
    <ProtocolCard
      {...props}
      onClickHandler={() => handleProtocolCardClick(uid)}
    />
  );

  return (
    <Picker
      show={show}
      onClose={onClose}
      title="Select Protocols to Delete"
      footer={(
        <Button disabled={!selectedProtocols.length > 0} color="neon-coral" icon="menu-purge-data" onClick={handleDeleteProtocols}>Delete Selected</Button>
      )}
      ItemComponent={SelectableProtocolCard}
      items={formattedProtocols()}
      searchPropertyPath={entityAttributesProperty}
      sortableProperties={[
        {
          label: 'Name',
          variable: ['attributes', 'name'],
          type: 'string',
          default: true,
        },
        {
          label: 'Installed',
          variable: ['attributes', 'installationDate'],
          type: 'date',
        },
        {
          label: 'Modified',
          variable: ['attributes', 'lastModified'],
          type: 'date',
        },
      ]}
    />
  );
};

export default ManageProtocolsOverlay;
