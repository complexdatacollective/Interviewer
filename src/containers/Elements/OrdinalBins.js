/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable } from '../../behaviours';

const Bin = ({ title, index, value, count }) => {
  console.log(index);
  const keyWithValue = value > 0 ? index + 1 : 0;
  return (
    <div className={'ordinal-bin__bin ordinal-bin__bin--' + count + '-' + keyWithValue}>
      <div className={'ordinal-bin__bin--title ordinal-bin__bin--title--' + count + '-' + keyWithValue}>{title}</div>
      <div className={'ordinal-bin__bin--content ordinal-bin__bin--content--' + count + '-' + keyWithValue}></div>
    </div>
  )
}

const OrdinalBins = ({ stage, prompt }) => {
  const binValues = _.orderBy(
    _.map(prompt.bins.values,
      (value, title) => [title, value]
    ),
    (titleValuePair) => titleValuePair[1],
    'desc',
  );
  const bins = binValues.map(
    (binValue, index) => <Bin title={binValue[0]} count={binValues.length} index={index} value={binValue[1]} />
  );
  
  return (
    <StaggeredTransitionGroup
      className="ordinal-bin"
      component="div"
      delay={animation.duration.fast * 0.2}
      duration={animation.duration.slow}
      start={animation.duration.slow + 3}
      transitionName="ordinal-bin--transition"
      transitionLeave={false}
    >
      {bins}
    </StaggeredTransitionGroup>
  );
}

OrdinalBins.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default droppable(scrollable(OrdinalBins));
