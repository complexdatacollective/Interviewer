import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Section from './Section';

const getApi = await import('../../api/getApi');
const api = await getApi.default();
const environmentApi = api.default;
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
  console.log('environmentApi', getApi, api, environmentApi);

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
