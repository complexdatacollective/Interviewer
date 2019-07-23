import React from 'react';
import PropTypes from 'prop-types';

import { Spinner } from '../ui/components';

const Loading = ({ message }) => (
  <div className="loading">
    <h4>{message}</h4>
    <Spinner small />
  </div>
);

Loading.propTypes = { message: PropTypes.string };

Loading.defaultProps = { message: '' };

export default Loading;
