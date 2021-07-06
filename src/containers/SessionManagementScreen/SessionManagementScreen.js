import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@codaco/ui/lib/components/Button';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Overlay } from '../Overlay';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';
import SessionSelect from './SessionSelect';
import ExportOptions from './ExportOptions';

const DataExportScreen = ({ show, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedSessions, setSelectedSessions] = useState([]);

  const dispatch = useDispatch();
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

  const handleSessionSelect = (selectedSessionIDs, toServer = false) => {
    if (toServer) {
      exportToServer(getExportableSessions())
        .then(complete)
        .catch((e) => { onClose(); throw e; });

      setStep(3);
      return;
    }

    setSelectedSessions(selectedSessionIDs);
    forward();
  };

  const handleOptionsContinue = () => {
    console.log('yoo');
    exportToFile(getExportableSessions())
      .then(complete)
      .catch((e) => { onClose(); throw e; });

    // setStep(3);
  };

  const handleClose = () => {
    if (step === 1) {
      onClose();
      return;
    }

    openDialog({
      type: 'Confirm',
      title: 'Cancel Export?',
      confirmLabel: 'Cancel Export',
      onConfirm: () => {
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

  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show]);

  if (!show) {
    return null;
  }

  console.log({
    step,
    selectedSessions,
  });

  const renderFooter = () => {
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
          <Button color="primary" onClick={handleOptionsContinue}>Export</Button>
        </div>
      );
    }

    return (
      <Button color="neon-coral" onClick={handleClose}>Cancel Export</Button>
    );
  };

  return (
    <>
      <SessionSelect // SessionPicker
        show={step === 1}
        selectedSessions={selectedSessions}
        onClose={onClose}
        onContinue={handleSessionSelect} // Selected sessions
      />
      <Overlay
        show={step !== 1}
        onClose={handleClose}
        title={ step === 2 ? 'Confirm File Export Options' : 'Exporting...'}
        footer={renderFooter()}
        className="export-settings-wizard"
      >
        { step === 2 && (
          <ExportOptions />
        )}
        { step === 3 && (
          <div className="session-management-screen__main session-management-screen__main--centered">
            <ExportSprite size={500} />
          </div>
        )}
      </Overlay>
    </>
  );
};

export default DataExportScreen;
