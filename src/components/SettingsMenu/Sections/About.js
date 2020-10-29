import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TabItemVariants from './TabItemVariants';
import getVersion from '../../../utils/getVersion';

const About = () => {
  const [appVersion, setAppVersion] = useState('0.0.0');

  getVersion().then(version => setAppVersion(version));

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h1>About Network Canvas Interviewer</h1>
          <code className="version-code">Version {appVersion}</code>
        </div>
      </motion.article>
    </React.Fragment>
  );
};

export default About;
