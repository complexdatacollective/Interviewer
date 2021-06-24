import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Steps } from '@codaco/ui/lib/components/Wizard';
import { Modal, Icon } from '@codaco/ui';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import SessionManager from './SessionManager';
import ExportOptions from './ExportOptions';

// const exportSessions = (sessionsToExport, toServer = false) => {
//   const exportFunction = toServer ? exportToServer : exportToFile;

//   exportFunction(sessionsToExport);
// };

const stepVariants = {
  initial: { opacity: 0, position: 'static' },
  exit: { opacity: 0, position: 'absolute' },
  show: { opacity: 1, position: 'static' },
};

const Step = ({ children }) => (
  <motion.div
    className="data-export-screen__step"
    variants={stepVariants}
    initial="initial"
    animate="show"
    exit="exit"
  >
    {children}
  </motion.div>
);

const DataExportScreen = ({ show, onClose }) => {
  const [step, setStep] = useState(2);
  const [sessionsToExport, setSessionsToExport] = useState(null);

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
        .catch(() => onClose());
      return;
    }

    setSessionsToExport(sessions);
    setStep(2);
  };

  const handleOptionsContinue = () => {
    setStep(3);
    exportToFile(sessionsToExport)
      .then(complete)
      .catch((e) => {
        console.log('caught error');
        console.error(e);
        onClose();
      });
  };

  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show]);

  return (
    <Modal show={show}>
      <div className="data-export-screen">
        { step !== 3 && (
          <div
            className="data-export-screen__close"
            onClick={onClose}
          >
            <Icon name="close" />
          </div>
        )}
        <AnimatePresence>
          <Steps index={step}>
            <Step key="select">
              <SessionManager
                onContinue={handleSessionSelect}
                onComplete={onClose}
              />
            </Step>
            <Step key="options">
              <ExportOptions onContinue={handleOptionsContinue} />
            </Step>
            <Step key="export">
              <div className="data-export-screen__main data-export-screen__main--centered">
                <ExportSprite size={300} />
              </div>
            </Step>
          </Steps>
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default DataExportScreen;
