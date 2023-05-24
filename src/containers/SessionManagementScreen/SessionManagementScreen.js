import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@codaco/ui/lib/components/Button';
import { remote } from 'electron';
import { Overlay } from '../Overlay';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { exportToPDF } from '../../utils/exportProcess';
import { getEntityAttributesWithNamesResolved } from '../../utils/networkFormat';
import SessionSelect from './SessionSelect';

/**
 * Returns the codebook entity definition for a given node type.
 * @param {string} entityType - The node type.
 * @param {object} codebook - The codebook object.
 * @returns {object} - The entity definition.
 */
const getNodeEntityDefinition = (entityType, codebook) => codebook.node[entityType].variables || {};

/**
 * Wrangle selected sessions into a format for easy rendering in a table. Returns an object where
 * the keys are the case IDs and the values are the nodes, with their attribute UUIDs replaced
 * with their human readable names.
 *
 * @param {object[]} sessions - The selected sessions.
 * @param {object} installedProtocols - The installed protocols.
 * @returns {object} - The formatted sessions.
*/
const getFormattedSessions = (sessions, installedProtocols) => sessions.reduce((acc, session) => {
  const {
    network: { nodes },
  } = session;

  const sessionProtocol = installedProtocols[session.protocolUID];

  // Replace node attribute UUIDs with their human readable names.
  const nodesWithAttributeLabels = nodes.map((node) => getEntityAttributesWithNamesResolved(
    node,
    getNodeEntityDefinition(node.type, sessionProtocol.codebook),
  ));

  return {
    ...acc,
    [session.caseId]: nodesWithAttributeLabels,
  };
}, {});

const DataExportScreen = ({ show }) => {
  const [selectedSessions, setSelectedSessions] = useState([]);

  const dispatch = useDispatch();
  const deleteSession = (id) => dispatch(sessionsActions.removeSession(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const reset = () => {
    setSelectedSessions([]);
  };

  const sessions = useSelector((state) => state.sessions);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const exportSessions = async () => {
    try {
      const { canceled, filePaths: userFilePath } = await remote.dialog.showOpenDialog({
        title: 'Select a location to save the interview data',
        buttonLabel: 'Select location',
        properties: ['openDirectory', 'createDirectory'],
        message: 'Select a location to save the interview data',
      });

      if (canceled || !userFilePath || !userFilePath[0]) {
        return;
      }

      const formattedSessions = getFormattedSessions(
        selectedSessions.map((selected) => sessions[selected]),
        installedProtocols,
      );

      console.log(formattedSessions, userFilePath[0]);
      // exportToPDF(formattedSessions, userFilePath);
    } catch (error) {
      console.log('error saving file', error); // eslint-disable-line no-console
    }
  };

  const handleDeleteSessions = () => {
    openDialog({
      type: 'Warning',
      title: `Delete ${selectedSessions.length} Interview Session${selectedSessions.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Permanently Delete',
      onConfirm: () => {
        selectedSessions.map((session) => deleteSession(session));
        setSelectedSessions([]);
      },
      message: (
        <p>
          This action will delete the selected interview data and cannot be undone.
          Are you sure you want to continue?
        </p>
      ),
    });
  };

  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const renderFooter = () => (
    <div
      className="action-buttons"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flex: '1',
      }}
    >
      <Button
        color="neon-coral"
        onClick={handleDeleteSessions}
        disabled={selectedSessions.length === 0}
        icon="menu-purge-data"
      >
        Delete Selected
      </Button>

      <div className="export-buttons">
        <Button
          color="platinum"
          onClick={() => exportSessions()}
          disabled={selectedSessions.length === 0}
        >
          Export Selected To PDF
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Overlay
        show
        title="Select Interview Sessions to Export or Delete"
        footer={renderFooter()}
        className="export-settings-wizard"
      >
        <SessionSelect // SessionPicker
          selectedSessions={selectedSessions}
          setSelectedSessions={setSelectedSessions}
        />
      </Overlay>
    </>
  );
};

export default DataExportScreen;
