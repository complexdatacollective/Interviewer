import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Spinner } from '@codaco/ui';

const Loading = ({ message, className, small }) => (
  <motion.div
    className={cx('loading', className)}
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2>{message}</h2>
    <Spinner small={small} />
  </motion.div>
);

Loading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
  small: PropTypes.bool,
};

Loading.defaultProps = {
  message: '',
  className: null,
  small: false,
};

export default Loading;
