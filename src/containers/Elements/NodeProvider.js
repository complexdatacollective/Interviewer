import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isMatch, isEqual } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { NodeList } from '../../components/Elements';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { makeGetProviderNodes } from '../../selectors/node-provider';

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
    onUpdateNodes: PropTypes.func,
    onDrag: PropTypes.func,
    currentIds: PropTypes.object.isRequired,
  };

  static defaultProps = {
    nodeColor: null,
    onUpdateNodes: () => {},
    onDrag: () => {},
  };

  componentDidMount() {
    this.props.onUpdateNodes(this.props.nodes);
  }

  componentWillReceiveProps(props) {
    if (!isEqual(props.nodes, this.props.nodes)) {
      this.props.onUpdateNodes(props.nodes);
    }
  }

  onSelectNode = (node) => {
    this.props.toggleNodeAttributes(node, this.props.activePromptAttributes);
  }

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

  render() {
    const {
      interaction,
      nodes,
      nodeColor,
      onDrag,
      currentIds,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, this.props.activePromptAttributes);

    switch (interaction) {
      case 'selectable':
        return (
          <NodeList
            nodes={nodes}
            nodeColor={nodeColor}
            label={label}
            draggableType="EXISTING_NODE"
            handleDropNode={this.handleDropNode}
            handleSelectNode={this.onSelectNode}
            selected={selected}
            currentIds={currentIds}
          />
        );
      case 'droppable':
        return (
          <NodeList
            nodes={nodes}
            nodeColor={nodeColor}
            label={label}
            draggableType="NEW_NODE"
            handleDropNode={this.onDropNode}
            droppableName="NODE_PROVIDER"
            acceptsDraggableType="EXISTING_NODE"
            onDrag={onDrag}
            currentIds={currentIds}
          />
        );
      default:
        return (
          <NodeList
            nodes={nodes}
            nodeColor={nodeColor}
            label={label}
            draggableType="NEW_NODE"
            handleDropNode={this.onDropNode}
            currentIds={currentIds}
          />
        );
    }
  }
}

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const getProviderNodes = makeGetProviderNodes();

  return function mapStateToProps(state, props) {
    const currentIds = { promptId: props.prompt.id, stageId: props.stage.id };

    const interaction = (props.selectable && 'selectable') ||
      (props.draggable && 'draggable') ||
      (props.droppable && 'droppable') ||
      'none';

    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodes: getProviderNodes(state, props),
      currentIds,
      interaction,
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
