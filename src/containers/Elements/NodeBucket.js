import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';
import { first, map, sortBy, reject, has } from 'lodash';
import { Node } from 'network-canvas-ui';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const propSort = (_, props) => {
  if (props.prompt.sociogram) {
    return props.prompt.sociogram.sort;
  } else if (props.prompt.bins) {
    return props.prompt.bins.sort;
  }
  return null;
};
const propLayout = (_, props) => {
  if (props.prompt.sociogram) {
    return props.prompt.sociogram.layout;
  } else if (props.prompt.bins) {
    return 'bin';
  }
  return null;
};

const makeGetUnplacedNodes = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();

  return createSelector(
    [networkNodesOfStageType, propLayout],
    (nodes, layout) => reject(nodes, node => has(node, layout)),
  );
};

export const makeGetNextUnplacedNodes = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    [getUnplacedNodes, propSort],
    (nodes, sort) => {
      let sortedNodes = [...nodes];
      if (sort && sort.by) { sortedNodes = sortBy([...sortedNodes], sort.by); }
      if (sort && sort.order === 'DESC') { sortedNodes = [...sortedNodes].reverse(); }
      if (sort && sort.number) { return sortedNodes.slice(0, sort.number); }
      return sortedNodes;
    },
  );
};


const draggableType = 'POSITIONED_NODE';

const NodeBucket = ({ nodes, layout, onDropNode, expanded }) => {
  if (!nodes) { return null; }
  // Styled as in Sociogram
  if (!expanded) {
    return (
      <div className="node-bucket">
        {first(nodes) &&
          <EnhancedNode
            label={label(first(nodes))}
            onDropped={(hits, coords) => onDropNode(hits, coords, first(nodes), layout)}
            draggableType={draggableType}
            {...first(nodes)}
          />}
      </div>
    );
  }
  // Styled as in ordinal bin
  return (
    <div className="expanded-bucket">
      {first(nodes) &&
        <EnhancedNode
          label={label(first(nodes))}
          onDropped={(hits, coords) => onDropNode(hits, coords, first(nodes), layout)}
          draggableType={draggableType}
          {...first(nodes)}
        />}
      {
        map(nodes, (node, index) => {
          if (index !== 0) {
            return (
              node &&
              <Node
                label={label(node)}
                key={index}
                {...node}
                inactive
              />
            );
          }
          return null;
        })
      }
    </div>
  );
};

NodeBucket.propTypes = {
  nodes: PropTypes.array,
  onDropNode: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
};

NodeBucket.defaultProps = {
  nodes: null,
  expanded: false,
};

function makeMapStateToProps() {
  const getNextUnplacedNodes = makeGetNextUnplacedNodes();
  return function mapStateToProps(state, props) {
    return {
      nodes: getNextUnplacedNodes(state, props),
      layout: propLayout(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeBucket);
