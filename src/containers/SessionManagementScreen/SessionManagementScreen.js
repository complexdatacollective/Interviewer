import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Steps } from '@codaco/ui/lib/components/Wizard';
import { Modal, Icon } from '@codaco/ui';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import SessionSelect from './SessionSelect';
import ExportOptions from './ExportOptions';

const stepVariants = {
  initial: { opacity: 0, position: 'static' },
  exit: { opacity: 0, position: 'absolute' },
  show: { opacity: 1, position: 'static' },
};

const Step = ({ children }) => (
  <motion.div
    className="session-management-screen__step"
    variants={stepVariants}
    initial="initial"
    animate="show"
    exit="exit"
  >
    {children}
  </motion.div>
);

const DataExportScreen = ({ show, onClose, mode }) => {
  const [step, setStep] = useState(1);
  const [sessionsToExport, setSessionsToExport] = useState(null);

  const dispatch = useDispatch();
  const openDialog = (dialog) => dispatch(dialogActions.openDialog(dialog));

  const reset = () => {
    setSessionsToExport(null);
    setStep(1);
  };

  const complete = () => {
    reset();
    onClose();
  };

  const handleSessionSelect = (sessions, toServer = false) => {
    if (toServer) {
      setStep(3);
      exportToServer(sessions)
        .then(complete)
        .catch((e) => { onClose(); throw e; });
      return;
    }

    setSessionsToExport(sessions);
    setStep(2);
  };

  const handleOptionsContinue = () => {
    setStep(3);
    exportToFile(sessionsToExport)
      .then(complete)
      .catch((e) => { onClose(); throw e; });
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

  return (
    <Modal show={show}>
      <div className="session-management-screen">
        { step !== 3 && (
          <div
            className="session-management-screen__close"
            onClick={handleClose}
          >
            <Icon name="close" />
          </div>
        )}
        <AnimatePresence>
          <Steps index={step}>
            <Step key="select">
              <SessionSelect
                onContinue={handleSessionSelect}
                onComplete={onClose}
                mode={mode}
              />
            </Step>
            <Step key="options">
              <ExportOptions onContinue={handleOptionsContinue} />
            </Step>
            <Step key="export">
              <div className="session-management-screen__main session-management-screen__main--centered">
                <ExportSprite size={500} />
              </div>
            </Step>
          </Steps>
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default DataExportScreen;
