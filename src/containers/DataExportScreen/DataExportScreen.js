import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ExportSprite from '@codaco/ui/lib/components/Sprites/ExportSprite';
import { Steps } from '@codaco/ui/lib/components/Wizard';
import { Modal } from '@codaco/ui';
import SessionSelect from './SessionSelect';

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
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((s) => s + 1);

  return (
    <Modal show={show}>
      <div className="data-export-screen">
        <div
          className="data-export-screen__close"
          onClick={onClose}
        >
          Close
        </div>
        <AnimatePresence>
          <Steps index={step}>
            <Step key="select">
              <SessionSelect onExport={nextStep} />
            </Step>
            <Step key="options">
              <div className="data-export-screen__main">
                Select opitons
              </div>
              <div className="data-export-screen__controls">
                <button type="button" onClick={nextStep}>
                  next
                </button>
              </div>
            </Step>
            <Step key="export">
              <div className="data-export-screen__main">
                <ExportSprite />
              </div>
              <div className="data-export-screen__controls">
                <button type="button" onClick={() => setStep(1)}>
                  back
                </button>
              </div>
            </Step>
          </Steps>
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default DataExportScreen;
