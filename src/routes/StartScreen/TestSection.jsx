import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import useApi from '../../api/web';
import { useDispatch, useSelector } from 'react-redux';
import { protocolAdded, selectAllProtocols } from '../../slices/protocols.slice';

const TestSection = () => {
  const dispatch = useDispatch();

  const installedProtocols = useSelector(selectAllProtocols);
  const installedProtocolStatus = useSelector(state => state.installedProtocols.status)
  const installedProtocolError = useSelector(state => state.installedProtocols.error)

  const handleCreateProtocol = () => dispatch(protocolAdded('test protocol', 'test content'));

  return (
    <Section className="start-screen-section">
      <motion.section
        style={{
          background: 'var(--color-tomato)',
          padding: '1.2rem 3.6rem',
        }}
      >
        <h1>API Test</h1>
        <button onClick={handleCreateProtocol}>Create Protocol</button>
        {installedProtocolStatus === 'loading' && <p>Loading...</p>}
        {installedProtocolStatus === 'failed' && <p>{installedProtocolError}</p>}
        {installedProtocolStatus === 'succeeded' && (
          <ul>
            {installedProtocols.map((protocol) => (
              <li key={protocol.id}>{protocol.name}</li>
            ))}
          </ul>
        )}
      </motion.section>
    </Section>
  );
};

TestSection.propTypes = {
};

TestSection.defaultProps = {
};

export default TestSection;
