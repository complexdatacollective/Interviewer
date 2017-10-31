import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { map, orderBy, filter, has } from 'lodash';
import { createSelector } from 'reselect';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { NodeList } from '../../components/Elements';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';

const OrdinalBins = ({ prompt, nodes, onDropNode }) => {
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
        onDropNode={onDropNode}
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

const Bin = ({ title, index, value, count, nodes, onDropNode }) => {
  const keyWithValue = value > 0 ? index + 1 : 0;
  const ordinalBinName = `ORDINAL_BIN-${index}`;
  const binNodes = filter(nodes, node => node.bin === ordinalBinName);

  return (
    <div className={`ordinal-bin__bin ordinal-bin__bin--${count}-${keyWithValue}`}>
      <div className={`ordinal-bin__bin--title ordinal-bin__bin--title--${count}-${keyWithValue}`}>{title}</div>
      <div className={`ordinal-bin__bin--content ordinal-bin__bin--content--${count}-${keyWithValue}`}>
        <NodeList
          nodes={binNodes}
          droppableName={ordinalBinName}
          acceptsDraggableType="POSITIONED_NODE"
          draggableType="POSITIONED_NODE"
          styled={false}
          handleDropNode={(hits, node) => onDropNode(hits, null, node)}
          label={node => `${node.nickname}`}
        />
      </div>
    </div>
  );
};

Bin.propTypes = {
  onDropNode: PropTypes.func.isRequired,
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
  nodes: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  onDropNode: PropTypes.func.isRequired,
};

const makeGetPlacedNodes = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();

  return createSelector(
    [networkNodesOfStageType],
    nodes => filter(nodes, node => has(node, 'bin')),
  );
};

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();

  return function mapStateToProps(state, props) {
    return {
      nodes: getPlacedNodes(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(OrdinalBins);
