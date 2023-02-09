import { useState, ChangeEvent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '@codaco/ui';
import Section from './Section';
import { useGetProtocolsQuery, useAddProtocolMutation } from '../../slices/api.slice';
import { Protocol } from '@codaco/shared-consts/src/protocol';


const TestSection = () => {
  const [file, setFile] = useState<File>();

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
    if (!file) {
      return;
    }

    try {
      const result = await addProtocol(file).unwrap()
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const guardedError: string = useMemo(() => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'error';
  }, [error]);

  // Capture NODE_ENV
  const platform = import.meta.env.VITE_APP_PLATFORM || 'web';

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
        {isLoading && <Spinner />}
        {isError && <p>{guardedError}</p>}
        {isSuccess && (
          <ul>
            {protocols.map((protocol: Protocol) => (
              <li key={protocol.name}>{protocol.name}</li>
            ))}
            {isFetching && <Spinner />}
          </ul>
        )}
      </motion.section>
      <section
        style={{
          background: 'var(--color-tomato)',
          padding: '1.2rem 3.6rem',
        }}
      >
        <h1>Add protocol</h1>
        <input
          type="file"
          accept=".netcanvas"
          onChange={handleFileChange}
        />
        <div>{file && `${file.name} - ${file.type}`}</div>
        <button
          onClick={handleCreateProtocol}
          disabled={isAddingProtocol}
        >
          Upload
        </button>
      </section>
    </Section>
  );
};



TestSection.propTypes = {
};

TestSection.defaultProps = {
};

export default TestSection;
