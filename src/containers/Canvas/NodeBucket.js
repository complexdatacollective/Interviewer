import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Node from '../Node';
import { DragSource, DropObstacle } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { makeGetNextUnplacedNode } from '../../selectors/canvas';

const EnhancedNode = DragSource(Node);

class NodeBucket extends PureComponent {
  static propTypes = {
    allowPositioning: PropTypes.bool,
    node: PropTypes.object,
  };

  static defaultProps = {
    allowPositioning: true,
    node: null,
  };

  render() {
    const {
      allowPositioning,
      node,
    } = this.props;

    if (!allowPositioning || !node) { return (<div />); }

    return (
      <div className="node-bucket">
        { node
          && (
          <EnhancedNode
            key={node[entityPrimaryKeyProperty]}
            meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
            scrollDirection={NO_SCROLL}
            {...node}
          />
          )}
      </div>
    );
  }
}

const makeMapStateToProps = () => {
  const getNextUnplacedNode = makeGetNextUnplacedNode();

  const mapStateToProps = (state, {
    layoutVariable, subject, sortOrder, stage,
  }) => {
    const node = getNextUnplacedNode(state, {
      layoutVariable, subject, sortOrder, stage,
    });

    return {
      node,
    };
  };

  return mapStateToProps;
};

export { NodeBucket };

export default compose(
  DropObstacle,
  connect(makeMapStateToProps),
)(NodeBucket);
