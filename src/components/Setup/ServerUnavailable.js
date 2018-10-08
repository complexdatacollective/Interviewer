import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../ui/components/';

const ServerUnavailable = ({ errorMessage, handleRetry }) => (
  <div className="server-unavailable">
    <h1>Server unavailable</h1>
    <p>{errorMessage}</p>
    <Button
      size="small"
      onClick={handleRetry}
    >
      Retry
    </Button>
  </div>
);

ServerUnavailable.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  handleRetry: PropTypes.func.isRequired,
};

export default ServerUnavailable;
