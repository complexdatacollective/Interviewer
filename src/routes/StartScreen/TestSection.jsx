import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Section from './Section';


/**
 * ELECTRON API (for desktop app)
 * 
 * This will use electron's ipcRenderer to communicate with the main process.
 * 
 */
const electronApi = () => {
  console.info('using electronApi()');
  const getAppVersion = async () => {
    const response = await window.api.getAppVersion();
    return response;
  };

  return {
    getAppVersion,
    getApiSource: window.api.getApiSource,
  };
};

/**
 * WEB API (for browser based app)
 * 
 * This will eventually use react query (or similar) for caching and suspenseful data fetching.
 * 
 */
const webApi = () => {
  console.info('using webApi()');
  const getAppVersion = async () => {
    const response = await fetch('http://localhost:3000/api/version');
    const json = await response.json();
    return json;
  };

  const getApiSource = () => 'web';

  return {
    getAppVersion,
    getApiSource,
  };
};

/**
 * MOBILE API (for iOS/Android)
 * 
 * This will eventually use react query (or similar) for caching and suspenseful data fetching.
 * 
 */
const mobileApi = () => {
};



/**
 * API HOOK
 * 
 * This hook will return the appropriate API based on the environment. Needs to be strongly typed
 * 
 * Perhaps we can use webpack configuration to determine the environment, and then use an alias to
 * import the appropriate API? This would reduce bundle size.
 * 
  */
const useApi = () => {
  // Switch between web, electron, and mobile API based on environment
  const getEnvironmentApi = () => {
    if (window.api) return electronApi();

    return webApi();
  };

  const environmentApi = getEnvironmentApi();


  const getAppVersion = async () => {
    const appVersion = await environmentApi.getAppVersion();
    return appVersion;
  };

  return {
    getAppVersion,
    getApiSource: environmentApi.getApiSource,
  };
};

const TestSection = () => {
  const {
    getAppVersion,
    getApiSource,
  } = useApi();

  const [appVersion, setAppVersion] = useState('loading...');

  useEffect(() => {
    getAppVersion().then((version) => setAppVersion(version));
  }, [getAppVersion]);

  return (
    <Section className="start-screen-section">
      <motion.section
        style={{
          background: 'var(--color-tomato)',
          padding: '1.2rem 3.6rem',
        }}
      >
        <h1>API Test</h1>
        <p>App Version: {appVersion}</p>
        <p>API Source: {getApiSource()}</p>
      </motion.section>
    </Section>
  );
};

TestSection.propTypes = {
};

TestSection.defaultProps = {
};

export default TestSection;
