/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { get, has } from 'lodash';
/**
  * Instruction Interface
  */
const Instructions = ({ stage: { title, content} }) => (
  <div className="instructions">
    { title }
  </div>
);

Instructions.propTypes = {
};

export default Instructions;
