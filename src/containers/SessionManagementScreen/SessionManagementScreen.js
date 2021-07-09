import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import sanitizeFilename from 'sanitize-filename';
import { get } from 'lodash';
import Button from '@codaco/ui/lib/components/Button';
import { Modal } from '@codaco/ui/lib/components/Modal';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Text } from '@codaco/ui/lib/components/Fields';
import { Scroller } from '@codaco/ui';
import { Overlay } from '../Overlay';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { withErrorDialog } from '../../ducks/modules/errors';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';
import SessionSelect from './SessionSelect';
import ExportOptions from '../../components/SettingsMenu/Sections/ExportOptions';

const fatalExportErrorAction = withErrorDialog((error) => ({
  type: 'SESSION_EXPORT_FATAL_ERROR',
  error,
}));

const DataExportScreen = ({ show, onClose }) => {
  const [step, setStep] = useState(3);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [filename, setFilename] = useState('networkCanvasExport');
  let abortHandler;

  const pairedServer = useSelector((state) => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);
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
  };

  const backward = () => {
    setStep(step - 1);
  };

  const complete = () => {
    reset();
    onClose();
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

  const exportSessions = (toServer = false) => {
    setStep(3);

    if (toServer) {
      exportToServer(getExportableSessions())
        .then(complete)
        .catch((e) => { onClose(); throw e; });
      return;
    }

    exportToFile(getExportableSessions(), filename)
      .then(({ run, abort }) => {
        // Attatch the dismisshandler to the toast now that we have exportPromise defined.
        abortHandler = abort;
        return run();
      })
      .then(complete)
      .catch((error) => {
        // Fatal error handling
        dispatch(fatalExportErrorAction(error));
        onClose();
      });
  };

  const handleClose = () => {
    // First step, just close because no work will be lost
    if (step === 1) {
      onClose();
      return;
    }

    openDialog({
      type: 'Confirm',
      title: 'Cancel Export?',
      confirmLabel: 'Cancel Export',
      onConfirm: () => {
        if (abortHandler) {
          abortHandler();
        }
        onClose();
      },
      message: (
        <p>
          This action will clear any previously selected sessions and cannot be undone.
          Are you sure you want to continue?
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

  const renderFooter = () => {
    if (step === 1) {
      return (
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
            { pairedServerConnection === 'ok' && (<Button onClick={() => exportSessions(true)} color="mustard" disabled={pairedServerConnection !== 'ok' || selectedSessions.length === 0}>Export Selected To Server</Button>)}
            <Button color="platinum" onClick={forward} disabled={selectedSessions.length === 0}>Export Selected To File</Button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flex: '1',
          }}
        >
          <Button color="platinum" onClick={backward} icon="arrow-left">Back to Selection</Button>
          <Button color="primary" onClick={() => exportSessions(false)}>Start Export Process</Button>
        </div>
      );
    }

    return (
      <Button color="neon-coral" onClick={handleClose}>Cancel Export</Button>
    );
  };

  const handleChangeFilename = (eventOrValue) => {
    const value = get(eventOrValue, ['target', 'value'], eventOrValue);
    const sanitizedValue = sanitizeFilename(value);
    setFilename(sanitizedValue);
  };

  return (
    <>
      <Modal show>
        <>
          <ExportSprite
            size={500}
            statusText={statusText}
            percentProgress={percentProgress}
          />
          <Button color="neon-coral" onClick={handleClose}>Cancel Export</Button>
        </>
      </Modal>
      <Overlay
        show={step !== 3}
        onClose={handleClose}
        title={step === 1 ? 'Select Interview Sessions to Export or Delete' : 'Confirm File Export Options'}
        footer={renderFooter()}
        className="export-settings-wizard"
      >
        { step === 1 && (
          <SessionSelect // SessionPicker
            selectedSessions={selectedSessions}
            setSelectedSessions={setSelectedSessions}
          />
        )}
        { step === 2 && (
          <Scroller>
            <div style={{
              width: '65rem',
              margin: '0 auto',
            }}
            >
              <h2>Filename for export:</h2>
              <Text
                placeholder="Enter a file name..."
                input={{
                  value: filename,
                  onChange: handleChangeFilename,
                }}
                adornmentRight={(
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center'}}>
                    <pre style={{ margin: 0 }}>.ZIP</pre>
                  </div>
                )}
              />
              <ExportOptions />
            </div>
          </Scroller>
        )}
      </Overlay>
    </>
  );
};

export default DataExportScreen;
