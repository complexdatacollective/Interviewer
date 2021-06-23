import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Steps } from '@codaco/ui/lib/components/Wizard';
import { Modal } from '@codaco/ui';
import { exportToFile, exportToServer } from '../../utils/exportProcess';
import SessionSelect from './SessionSelect';
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

  const nextStep = () => setStep((s) => s + 1);

  const handleSessionSelect = (sessions, toServer = false) => {
    if (toServer) {
      setStep(3);
      exportToServer(sessions);
      return;
    }

    setSessionsToExport(sessions);
    setStep(2);
  };

  const handleOptionsContinue = () => {
    setStep(3);
    exportToFile(sessionsToExport);
  };

  useEffect(() => {
    if (!show) {
      setSessionsToExport(null);
      setStep(1);
    }
  }, [show]);

  return (
    <Modal show={show}>
      <div className="data-export-screen">
        <button
          className="data-export-screen__close"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
        <AnimatePresence>
          <Steps index={step}>
            <Step key="select">
              <SessionSelect
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
