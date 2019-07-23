import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Spinner } from '../ui/components';

const Loading = ({ message, className }) => (
  <div className={cx('loading', className)}>
    <h4>{message}</h4>
    <Spinner small />
  </div>
);

Loading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

Loading.defaultProps = {
  message: '',
  className: null,
};

export default Loading;
