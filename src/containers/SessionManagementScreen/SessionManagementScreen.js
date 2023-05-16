import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import sanitizeFilename from 'sanitize-filename';
import Button from '@codaco/ui/lib/components/Button';
import { Modal } from '@codaco/ui/lib/components/Modal';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Overlay } from '../Overlay';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { withErrorDialog } from '../../ducks/modules/errors';
import { exportToPDF } from '../../utils/exportProcess';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';
import SessionSelect from './SessionSelect';

import { get } from '../../utils/lodash-replacements';

const fatalExportErrorAction = withErrorDialog((error) => ({
  type: 'SESSION_EXPORT_FATAL_ERROR',
  error,
}));

const DataExportScreen = ({ show, onClose }) => {
  const [step, setStep] = useState(3);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [filename, setFilename] = useState('networkCanvasExport');
  const [abortHandlers, setAbortHandlers] = useState(null);

  const { statusText, percentProgress } = useSelector((state) => state.exportProgress);

  const dispatch = useDispatch();
  const deleteSession = (id) => dispatch(sessionsActions.removeSession(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const reset = () => {
    setSelectedSessions([]);
    setStep(1);
  };

  const forward = () => {
    setStep(step + 1);
    console.log('step', step);
  };

  const sessions = useSelector((state) => state.sessions);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const getExportableSessions = () => selectedSessions
    .map((session) => {
      const sessionProtocol = installedProtocols[sessions[session].protocolUID];

      return asNetworkWithSessionVariables(
        session,
        sessions[session],
        sessionProtocol,
      );
    });

  const exportSessions = () => {
    setStep(2);

    // filepath will be from from user selected path.
    // right now, it's just the filename saved within project.
    const filepath = `${filename}.pdf`;

    exportToPDF(getExportableSessions(), filepath);
  };

  const handleClose = () => {
    // First step, just close because no work will be lost
    if (step === 1) {
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
      <Button color="neon-coral" onClick={handleDeleteSessions} disabled={selectedSessions.length === 0} icon="menu-purge-data">Delete Selected</Button>
      <div className="export-buttons">
        <Button color="platinum" onClick={() => exportSessions()} disabled={selectedSessions.length === 0}>Export Selected To PDF</Button>
        <Button color="platinum" onClick={forward} disabled={selectedSessions.length === 0}>Export Selected To File</Button>
      </div>
    </div>
  );

  const handleChangeFilename = (eventOrValue) => {
    const value = get(eventOrValue, ['target', 'value'], eventOrValue);
    const sanitizedValue = sanitizeFilename(value);
    setFilename(sanitizedValue);
  };

  return (
    <>
      <Modal show={!!statusText}>
        <div style={{ textAlign: 'center' }}>
          <ExportSprite
            size={500}
            statusText={statusText}
            percentProgress={percentProgress}
          />
          <Button color="neon-coral" onClick={handleClose}>Cancel Export</Button>
        </div>
      </Modal>
      <Overlay
        show
        onClose={handleClose}
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
