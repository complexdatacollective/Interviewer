import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import { AnimatePresence } from 'framer-motion';
import Section from './Section';
import { actionCreators as deviceActions } from '../../ducks/modules/deviceSettings';

const WhatsNewSection = () => {
  const showWhatsNew = useSelector((state) => state.deviceSettings.showWhatsNew);

  const dispatch = useDispatch();
  const dismissSection = () => dispatch(deviceActions.toggleSetting('showWhatsNew'));

  return (
    <AnimatePresence>
      { showWhatsNew && (
        <Section className="start-screen-section whats-new-section">
          <main className="whats-new-section__content">
            <header>
              <h2>What&apos;s New</h2>
            </header>
            <div className="content-section">
              <p>
                Welcome to the stable release of Interviewer. In future versions, this card
                will be used to summarize changes and new features.
              </p>
            </div>
          </main>
          <footer className="whats-new-section__footer">
            <Button key="unpair" color="platinum" onClick={dismissSection}>Dismiss</Button>
          </footer>
        </Section>
      )}
    </AnimatePresence>
  );
};

export default WhatsNewSection;
