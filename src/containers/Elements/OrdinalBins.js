import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { map, orderBy, first, filter, has } from 'lodash';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { NodeList } from '../../components/Elements';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { networkNodesForPrompt } from '../../selectors/interface';

const OrdinalBins = ({ prompt, nodes, updateNode }) => {
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
        nodes={nodes}
        updateNode={updateNode}
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

const Bin = ({ title, index, value, count, nodes, updateNode }) => {
  const keyWithValue = value > 0 ? index + 1 : 0;
  const ordinalBinName = `ORDINAL_BIN-${index}`;
  console.log(ordinalBinName);
  const onDropNode = (hits, node) => {
    const hit = first(hits);
    console.log(hit);
    if (hit === ordinalBinName) {
      updateNode({ ...node, bin: index });
    }
  };

  return (
    <div className={`ordinal-bin__bin ordinal-bin__bin--${count}-${keyWithValue}`}>
      <div className={`ordinal-bin__bin--title ordinal-bin__bin--title--${count}-${keyWithValue}`}>{title}</div>
      <NodeList
        classNames={`ordinal-bin__bin--content ordinal-bin__bin--content--${count}-${keyWithValue}`}
        nodes={filter(nodes, node => has(node, { bin: index }))}
        droppableName={ordinalBinName}
        acceptsDraggableType="POSITIONED_NODE"
        draggableType="EXISTING_NODE"
        styled={false}
        handleDropNode={onDropNode}
      />
    </div>
  );
};

Bin.propTypes = {
  updateNode: PropTypes.func.isRequired,
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
  updateNode: PropTypes.func.isRequired,
  nodes: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
  return {
    nodes: networkNodesForPrompt(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrdinalBins);
