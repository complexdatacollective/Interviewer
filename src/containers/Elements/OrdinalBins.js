import React from 'react';
import PropTypes from 'prop-types';
import { map, orderBy } from 'lodash';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { NodeList } from '../../components/Elements';

export const OrdinalBins = ({ prompt }) => {
  const binValues = orderBy(
    map(prompt.bins.values,
      (value, title) => [title, value],
    ),
    titleValuePair => titleValuePair[1],
    'desc',
  );

  const bins = binValues.map(
    (binValue, index) => (
      <Bin
        title={binValue[0]}
        count={binValues.length}
        index={index}
        key={index}
        value={binValue[1]}
      />
    ),
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
};

const Bin = ({ title, index, value, count, nodes }) => {
  const keyWithValue = value > 0 ? index + 1 : 0;
  return (
    <div className={`ordinal-bin__bin ordinal-bin__bin--${count}-${keyWithValue}`}>
      <div className={`ordinal-bin__bin--title ordinal-bin__bin--title--${count}-${keyWithValue}`}>{title}</div>
      <NodeList
        classNames={`ordinal-bin__bin--content ordinal-bin__bin--content--${count}-${keyWithValue}`}
        nodes={nodes}
        droppableName={`ORDINAL_BIN-${index}`}
        acceptsDraggableType="POSITIONED_NODE"
        draggableType="EXISTING_NODE"
        styled={false}
      />
    </div>
  );
};

Bin.propTypes = {
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  nodes: PropTypes.array,
};

Bin.defaultProps = {
  nodes: [],
};

OrdinalBins.propTypes = {
  prompt: PropTypes.object.isRequired,
};

export default OrdinalBins;
