import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@codaco/ui/lib/components/Button';
import { Spinner } from '@codaco/ui';
import { ipcRenderer, remote } from 'electron';
import { Overlay } from '../Overlay';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as toastActions } from '../../ducks/modules/toasts';
import { getEntityAttributesWithNamesResolved } from '../../utils/networkFormat';
import SessionSelect from './SessionSelect';

const fs = require('fs');

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

const DataExportScreen = ({ show, onClose }) => {
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [abortHandlers, setAbortHandlers] = useState(null);
  const dispatch = useDispatch();

  // Listen for the PDFS_DONE event from the main process.
  // Toast when the export is complete.

  const deleteSession = (id) => dispatch(sessionsActions.removeSession(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const reset = () => {
    setSelectedSessions([]);
  };

  const sessions = useSelector((state) => state.sessions);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const exportSessions = async () => {
    try {
      const formattedSessions = getFormattedSessions(
        selectedSessions.map((selected) => sessions[selected]),
        installedProtocols,
      );

      const { canceled, filePaths: userFilePath } = await remote.dialog.showOpenDialog({
        title: 'Select a location to save the interview data',
        buttonLabel: 'Select location',
        properties: ['openDirectory', 'createDirectory'],
        message: 'Select a location to save the interview data',
      });

      // if directory is not empty, warn the user that they its contents may be overwritten

      fs.readdir(userFilePath[0], async (_, files) => {
        // Mac OS creates a hidden .DS_Store file in every directory
        // Windows creates a hidden desktop.ini file in every directory
        // We want to ignore these files when checking if the directory is empty
        const includesHiddenFiles = files.includes('.DS_Store') || files.includes('desktop.ini');
        if (
          (files.length > 1 && includesHiddenFiles) || (files.length > 0 && !includesHiddenFiles)
        ) {
          const overwrite = await remote.dialog.showMessageBox({
            message: `${userFilePath[0]} contains files.`,
            detail: ' Any and all files in this directory may be overwritten. Are you sure you want to continue?',
            type: 'warning',
            buttons: ['Continue', 'Cancel'],
          });
          if (overwrite.response === 1) {
            // eslint-disable-next-line no-useless-return
            return;
          }
        }
      });

      if (canceled || !userFilePath || !userFilePath[0]) {
        return;
      }

      ipcRenderer.send('EXPORT_TO_PDF', formattedSessions, userFilePath[0]);
    } catch (error) {
      console.log('error saving file', error); // eslint-disable-line no-console
      onClose();
      return;
    }

    // Close the overlay and show an exporting toast.
    onClose();
    dispatch(toastActions.addToast({
      id: 'exporting',
      type: 'info',
      title: 'Exporting...',
      CustomIcon: (<Spinner small />),
      autoDismiss: false,
      content: (
        <>
          <p>Your sessions are being exported.</p>
        </>
      ),
    }));

    // Toast when the export is complete.
    ipcRenderer.on('PDFS_DONE', () => {
      dispatch(toastActions.removeToast('exporting'));
      dispatch(toastActions.addToast({
        type: 'success',
        title: 'Export Complete!',
        autoDismiss: true,
        content: (
          <>
            <p>Your sessions were exported successfully.</p>
          </>
        ),
      }));

      selectedSessions.forEach((session) => dispatch(sessionsActions.setSessionExported(session)));
      ipcRenderer.removeAllListeners('PDFS_DONE');
    });
  };

  const handleClose = () => {
    // nothing selected, just close because no work will be lost
    if (selectedSessions.length === 0) {
      onClose();
      return;
    }

    if (abortHandlers) {
      abortHandlers.setConsideringAbort(true);
    }

    openDialog({
      type: 'Confirm',
      title: 'Cancel Export?',
      confirmLabel: 'Cancel Export',
      onConfirm: () => {
        if (abortHandlers) {
          abortHandlers.abort();
        }
        onClose();
      },
      onCancel: () => {
        if (abortHandlers) {
          abortHandlers.setConsideringAbort(false);
        }
      },
      message: (
        <p>
          This will cancel the export process, as well as clear any previously selected sessions.
          It cannot be undone. Are you sure you want to continue?
        </p>
      ),
    });
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
        onClose={handleClose}
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
