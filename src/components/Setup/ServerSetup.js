import React from 'react';
import PropTypes from 'prop-types';

import { ServerCard } from '../../components/Setup';

/**
 * Provides a wrapper for common server setup tasks, rendering a Server card.
 * Used for pairing & protocol selection.
 */
const ServerSetup = ({ children, server }) => (
  <div className="server-setup">
    <ServerCard className="server-setup__card" data={server}>{server.host}</ServerCard>
    <React.Fragment>
      { children }
    </React.Fragment>
  </div>
);

ServerSetup.defaultProps = {
  children: [],
};

ServerSetup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  server: PropTypes.shape({
    apiUrl: PropTypes.string.isRequired,
    host: PropTypes.string,
  }).isRequired,
};

export default ServerSetup;
