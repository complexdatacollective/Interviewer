import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { makeGetNextUnplacedNode, makeGetSociogramOptions, sociogramOptionsProps } from '../../selectors/sociogram';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

export class NodeBucket extends Component {
  static propTypes = {
    node: PropTypes.object,
    updateNode: PropTypes.func.isRequired,
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    node: null,
  };

  onDropNode = (hits, coords, node) => {
    const { layoutVariable } = this.props;

    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    this.props.updateNode({ ...node, [layoutVariable]: relativeCoords });
  };

  render() {
    const {
      node,
    } = this.props;

    if (!node) { return null; }

    return (
      <div className="node-bucket">
        { node &&
          <EnhancedNode
            label={label(node)}
            onDropped={(hits, coords) => this.onDropNode(hits, coords, node)}
            draggableType={draggableType}
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
      node: getNextUnplacedNode(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeBucket);
