import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Node } from 'network-canvas-ui';
import { makeGetNextUnplacedNode, makeGetSociogramOptions } from '../selectors/sociogram';
import { getNodeLabelFunction } from '../selectors/interface';
import { DragSource } from '../behaviours/DragAndDrop';
import { NO_SCROLL } from '../behaviours/DragAndDrop/DragManager';

const EnhancedNode = DragSource(Node);

class NodeBucket extends PureComponent {
  static propTypes = {
    getLabel: PropTypes.func.isRequired,
    node: PropTypes.object,
  };

  static defaultProps = {
    node: null,
  };

  render() {
    const {
      getLabel,
      node,
    } = this.props;

    if (!node) { return null; }

    return (
      <div className="node-bucket">
        { node &&
          <EnhancedNode
            label={getLabel(node)}
            meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
            scrollDirection={NO_SCROLL}
            {...node}
          />
        }
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getNextUnplacedNode = makeGetNextUnplacedNode();
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      getLabel: getNodeLabelFunction(state),
      node: getNextUnplacedNode(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

export { NodeBucket };

export default compose(
  connect(makeMapStateToProps),
)(NodeBucket);
