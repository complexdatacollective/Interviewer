/* eslint-disable */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEqual, isMatch, uniqueId } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { makeGetProviderNodes } from '../../selectors/node-provider';
import NodeList from '../../components/Elements/NodeList';

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodeProvider extends Component {
  static propTypes = {
    newNodeAttributes: PropTypes.object.isRequired,
    activePromptAttributes: PropTypes.object.isRequired,
    nodes: PropTypes.array.isRequired,
    nodeColor: PropTypes.string,
    interaction: PropTypes.string.isRequired,
    addOrUpdateNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired,
    toggleNodeAttributes: PropTypes.func.isRequired,
    onUpdate: PropTypes.func,
    onDragNode: PropTypes.func,
    currentIds: PropTypes.object.isRequired,
  };

  static defaultProps = {
    nodeColor: null,
    onDragNode: () => {},
    onDropNode: () => {},
    onUpdate: () => {},
  };

  constructor(props) {
    super(props);

    this.state = { isDragging: false, id: uniqueId() };
  }

  componentDidMount() {
    this.onUpdate(this.props.nodes);
  }

  componentWillReceiveProps(props) {
    if (!isEqual(props.nodes, this.props.nodes)) {
      this.onUpdate(props.nodes);
    }
  }

  onUpdate = (nodes) => {
    this.props.onUpdate({ nodes });
  };

  onDropNode = (hits, node) => {
    hits.forEach((hit) => {
      switch (hit.name) {
        case 'MAIN_NODE_LIST':
          this.props.addOrUpdateNode({ ...this.props.newNodeAttributes, ...node });
          break;
        case 'NODE_BIN':
          this.props.removeNode(node.uid);
          break;
        default:
      }
    });
  }

  getNodeListProps() {
    const {
      activePromptAttributes,
      currentIds,
      interaction,
      nodes,
      nodeColor,
      draggableType,
      acceptsDraggableType,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, activePromptAttributes);

    const defaultProps = {
      activePromptAttributes,
      interaction,
      currentIds,
      label,
      nodes,
      nodeColor,
      draggableType,
      acceptsDraggableType,
      droppableName: `NODE_PROVIDER_${this.state.id}`,
    };

    switch (interaction) {
      case 'selectable':
        return {
          ...defaultProps,
          onSelectNode: this.onSelectNode,
          selected,
        };
      case 'draggable':
        return {
          ...defaultProps,
          onDropNode: this.onDropNode,
          onDragNode: this.onDragNode,
        };
      default:
        return defaultProps;
    }
  }

  render() {
    console.log('NODE_PROVIDER', this.getNodeListProps());

    return (
      <NodeList
        {...this.getNodeListProps()}
      />
    );
  }
}

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const getProviderNodes = makeGetProviderNodes();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodes: getProviderNodes(state, props),
      draggableType: 'NEW_NODE',
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addOrUpdateNode: bindActionCreators(networkActions.addOrUpdateNode, dispatch),
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeProvider);
