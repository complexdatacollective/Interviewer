import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Spinner } from '@codaco/ui';

const Loading = ({ message, className }) => (
  <motion.div
    className={cx('loading', className)}
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2>{message}</h2>
    <Spinner />
  </motion.div>
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
