import { motion } from 'framer-motion';
import Section from './Section';
import { v4 as uuid } from 'uuid';
import { useGetProtocolsQuery, useAddProtocolMutation } from '../../slices/api.slice';

const TestSection = () => {

  const {
    data: protocols,
    isLoading,
    isFetching, // When a request is in flight, but there is cached data being displayed
    isSuccess,
    isError,
    error
  } = useGetProtocolsQuery();

  const [addProtocol, { isLoading: isAddingProtocol }] = useAddProtocolMutation();

  const handleCreateProtocol = async () => {
    try {
      const result = await addProtocol({ id: uuid(), name: 'Test Protocol' }).unwrap()
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }

  // Capture NODE_ENV
  console.log(process.env.NODE_ENV);
  const platform = process.env.REACT_APP_PLATFORM || 'web';

  console.log('platform', platform, process.env);

  return (
    <Section className="start-screen-section">
      <motion.section
        style={{
          background: 'var(--color-tomato)',
          padding: '1.2rem 3.6rem',
        }}
      >
        <h1>API Test</h1>
        <h2>Platform: {platform}</h2>
        <button onClick={handleCreateProtocol} disabled={isAddingProtocol}>Create Protocol</button>
        {isLoading && <p>Loading...</p>}
        {isError && <p>{error.toString()}</p>}
        {isSuccess && (
          <ul>
            {protocols.map((protocol) => (
              <li key={protocol.id}>{protocol.name}</li>
            ))}
            {isFetching && <p>Updating...</p>}
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
