import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import sanitizeFilename from 'sanitize-filename';

import { Scroller } from '@codaco/ui';
import Button from '@codaco/ui/lib/components/Button';
import { Text } from '@codaco/ui/lib/components/Fields';
import { Modal } from '@codaco/ui/lib/components/Modal';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';

import ExportOptions from '../../components/SettingsMenu/Sections/ExportOptions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { withErrorDialog } from '../../ducks/modules/errors';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { isCapacitor } from '../../utils/Environment';
import { exportToFile } from '../../utils/exportProcess';
import { get } from '../../utils/lodash-replacements';
import { Overlay } from '../Overlay';
import SessionSelect from './SessionSelect';

const fatalExportErrorAction = withErrorDialog((error) => ({
  type: 'SESSION_EXPORT_FATAL_ERROR',
  error,
}));

const getInitialFilename = () => `networkCanvasExport-${Date.now()}`;

const DataExportScreen = ({ show, onClose }) => {
  const [step, setStep] = useState(3);
  const [selectedSessions, setSelectedSessions] = useState([]);

  // Set the default filename to 'networkCanvasExport-<timestamp>'
  const [filename, setFilename] = useState(getInitialFilename());
  const [abortHandlers, setAbortHandlers] = useState(null);

  const { statusText, percentProgress } = useSelector(
    (state) => state.exportProgress,
  );

  const dispatch = useDispatch();
  const deleteSession = (id) => dispatch(sessionsActions.removeSession(id));
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const reset = useCallback(() => {
    setFilename(getInitialFilename());
    setSelectedSessions([]);
    setStep(1);
  }, []);

  const forward = () => {
    setStep(step + 1);
  };

  const backward = () => {
    setStep(step - 1);
  };

  const exportSessions = () => {
    setStep(3);

    // The maintained @codaco/network-exporters pipeline maps raw sessions
    // itself, so we pass the selected session keys (not pre-formatted networks).
    exportToFile(selectedSessions)
      .then(({ run, abort, setConsideringAbort }) => {
        setAbortHandlers({
          abort,
          setConsideringAbort,
        });

        return run();
      })
      .then(onClose)
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
          This will cancel the export process, as well as clear any previously
          selected sessions. It cannot be undone. Are you sure you want to
          continue?
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
          This action will delete the selected interview data and cannot be
          undone. Are you sure you want to continue?
        </p>
      ),
    });
  };

  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show, reset]);

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
              onClick={forward}
              disabled={selectedSessions.length === 0}
            >
              Export Selected To File
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flex: '1',
        }}
      >
        <Button color="platinum" onClick={backward} icon="arrow-left">
          Back to Selection
        </Button>
        <Button color="primary" onClick={() => exportSessions()}>
          Start Export Process
        </Button>
      </div>
    );
  };

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
          <Button color="neon-coral" onClick={handleClose}>
            Cancel Export
          </Button>
        </div>
      </Modal>
      <Overlay
        show={step !== 3}
        onClose={handleClose}
        title={
          step === 1
            ? 'Select Interview Sessions to Export or Delete'
            : 'Confirm File Export Options'
        }
        footer={renderFooter()}
        className="export-settings-wizard"
      >
        {step === 1 && (
          <SessionSelect // SessionPicker
            selectedSessions={selectedSessions}
            setSelectedSessions={setSelectedSessions}
          />
        )}
        {step === 2 && (
          <Scroller>
            <div
              style={{
                maxWidth: '65rem',
                padding: '0 2.4rem',
                margin: '0 auto',
              }}
            >
              {/* NOTE: the @codaco/network-exporters pipeline derives the zip
                  filename itself (networkCanvasExport-<timestamp>.zip), so this
                  custom-name input no longer changes the saved filename. Kept
                  for now to avoid a UI change; revisit if user-naming is needed. */}
              {isCapacitor() && (
                <>
                  <h2>Filename for export:</h2>
                  <p>
                    Your data will be saved to your device in a zip file
                    called&nbsp;
                    <code>networkCanvasExport</code>. If you wish to change this
                    name, you can do so here. Do not add a file extension ( such
                    as&nbsp;
                    <code>.ZIP</code>) – this will be added automatically.
                  </p>
                  <Text
                    placeholder="Enter a file name..."
                    input={{
                      value: filename,
                      onChange: handleChangeFilename,
                    }}
                    adornmentRight={
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <pre style={{ margin: 0 }}>.ZIP</pre>
                      </div>
                    }
                  />
                </>
              )}
              <ExportOptions />
            </div>
          </Scroller>
        )}
      </Overlay>
    </>
  );
};

export default DataExportScreen;
