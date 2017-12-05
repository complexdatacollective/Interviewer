import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colorDictionary } from 'network-canvas-ui';
import { isMatch } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import NodeList from '../../components/Elements/NodeList';
import nodeProvider from '../../behaviours/nodeProvider';
import { Panel } from '../../components/Elements';

const colorPresets = [
  colorDictionary['edge-alt-1'],
  colorDictionary['edge-alt-2'],
  colorDictionary['edge-alt-3'],
  colorDictionary['edge-alt-4'],
  colorDictionary['edge-alt-5'],
];

const getHighlight = (highlight, panelNumber) => {
  if (colorDictionary[highlight]) { return colorDictionary[highlight]; }
  if (panelNumber > 0) { return colorPresets[panelNumber % colorPresets.length]; }
  return null;
};

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodePanel extends Component {
  static propTypes = {
    newNodeAttributes: PropTypes.object.isRequired,
    addOrUpdateNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired,
    activePromptAttributes: PropTypes.object.isRequired,
    interaction: PropTypes.string.isRequired,
    nodes: PropTypes.array.isRequired,
    nodeColor: PropTypes.string,
    draggableType: PropTypes.string,
    droppableName: PropTypes.string,
    acceptsDraggableType: PropTypes.string,
    title: PropTypes.string,
    index: PropTypes.number,
    highlight: PropTypes.bool,
  };

  static defaultProps = {
    nodeColor: null,
    draggableType: 'NEW_NODE',
    droppableName: null,
    acceptsDraggableType: null,
    title: '',
    index: null,
    highlight: false,
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
      interaction,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, activePromptAttributes);

    const defaultProps = {
      activePromptAttributes,
      label,
      selected,
      nodes: this.props.nodes,
      nodeColor: this.props.nodeColor,
      draggableType: this.props.draggableType,
      acceptsDraggableType: this.props.acceptsDraggableType,
      droppableName: this.props.droppableName,
    };

    switch (interaction) {
      case 'selectable':
        return {
          ...defaultProps,
          onSelectNode: this.onSelectNode,
        };
      case 'draggable':
        return {
          ...defaultProps,
          onDropNode: this.onDropNode,
        };
      default:
        return defaultProps;
    }
  }

  render() {
    const {
      title,
      index,
      highlight,
    } = this.props;

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(highlight, index)}
      >
        <NodeList
          {...this.getNodeListProps()}
        />
      </Panel>
    );
  }
}

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
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

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  nodeProvider,
)(NodePanel);
