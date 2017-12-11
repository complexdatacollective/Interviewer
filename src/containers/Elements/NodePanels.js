/* eslint-disable */

import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colorDictionary } from 'network-canvas-ui';
import { isMatch, differenceBy } from 'lodash';
import { networkNodes, makeNetworkNodesForOtherPrompts } from '../../selectors/interface';
import { getExternalData } from '../../selectors/protocol';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { Panel, Panels, NodeList } from '../../components/Elements';
import { MonitorDragSource } from '../../behaviours/DragAndDrop';
import configurePanels from '../../behaviours/configurePanels';

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

// const accepts = (
//   meta.itemType === 'EXISTING_NODE' &&
//   (meta.stageId !== newNodeAttributes.stageId || meta.promptId !== newNodeAttributes.promptId)
// );

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodePanels extends PureComponent {

  static defaultProps = {
    panels: [],
    isDragging: false,
  };

  onDrop = (item) => {
    console.log(item);
    alert('panels');
    // hits.forEach((hit) => {
    //   switch (hit.name) {
    //     case 'MAIN_NODE_LIST':
    //       this.props.addOrUpdateNode({ ...this.props.newNodeAttributes, ...node });
    //       break;
    //     case 'NODE_BIN':
    //       this.props.removeNode(node.uid);
    //       break;
    //     default:
    //   }
    // });
  }

  panelHasNodes = (index) => this.props.panels[index].nodes.length;

  panelIsOpen = (index) =>
    this.props.isDragging || this.panelHasNodes(index) > 0;

  anyPanelIsOpen = () =>
    this.props.panels
      .map((panel, index) => this.panelIsOpen(index))
      .reduce((memo, panelOpen) => memo || panelOpen, false);

  getInteractionHandlers(interaction) {
    switch (interaction) {
      case 'selectable':
        return {
          onSelect: this.onSelect,
        };
      case 'draggable':
        return {
          onDrop: this.onDrop,
        };
      default:
        return {};
    }
  }

  renderNodePanel = (panel, index) => {
    const {
      activePromptAttributes,
    } = this.props;

    const {
      title,
      highlight,
      ...nodeListProps,
    } = panel;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, activePromptAttributes);
    const accepts = ({ meta, wfpwfp }) => {
      return (
        meta.wfiep == false &&
        meta.itemType === 'EXISTING_NODE' &&
        (meta.stageId !== activePromptAttributes.stageId || meta.promptId !== activePromptAttributes.promptId)
      );
    }

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(highlight, index)}
        minimise={!this.panelIsOpen(index)}
      >
        <NodeList
          {...nodeListProps}
          {...this.getInteractionHandlers(nodeListProps.interaction)}
          accepts={accepts}
          label={label}
          selected={selected}
        />
      </Panel>
    );
  }

  render() {
    return (
      <Panels minimise={!this.anyPanelIsOpen()}>
        {this.props.panels.map(this.renderNodePanel)}
      </Panels>
    );
  }
}

const getNodesForDataSource = ({ nodes, existingNodes, externalData, dataSource }) => (
  dataSource === 'existing' ?
    existingNodes :
    differenceBy(externalData[dataSource].nodes, nodes, 'uid')
);

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return function mapStateToProps(state, props) {
    const nodes = networkNodes(state);
    const existingNodes = networkNodesForOtherPrompts(state, props);
    const externalData = getExternalData(state);

    const panels = props.panels.map(
      panel => ({
        ...panel,
        nodes: getNodesForDataSource({
          nodes,
          existingNodes,
          externalData,
          dataSource: panel.dataSource,
        }),
      }),
    );

    return {
      isDragging: state.draggable.isDragging,
      activePromptAttributes: props.prompt.additionalAttributes,
      panels,
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
  configurePanels,
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging']),
)(NodePanels);
