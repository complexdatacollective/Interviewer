import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colorDictionary } from 'network-canvas-ui';
import { includes, map, differenceBy } from 'lodash';
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

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodePanels extends PureComponent {
  static propTypes = {
    toggleNodeAttributes: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired,
    activePromptAttributes: PropTypes.object.isRequired,
    newNodeAttributes: PropTypes.object.isRequired,
    isDragging: PropTypes.bool,
    externalData: PropTypes.array.isRequired,
    panels: PropTypes.array,
  };

  static defaultProps = {
    panels: [],
    isDragging: false,
  };

  onDrop = ({ meta }, dataSource) => {
    if (dataSource === 'existing') {
      this.props.toggleNodeAttributes(meta.uid, { ...this.props.activePromptAttributes });
    } else {
      this.props.removeNode(meta.uid);
    }
  }

  panelHasNodes = index => this.props.panels[index].nodes.length;

  panelIsOpen = index =>
    this.props.isDragging || this.panelHasNodes(index) > 0;

  anyPanelIsOpen = () =>
    this.props.panels
      .map((panel, index) => this.panelIsOpen(index))
      .reduce((memo, panelOpen) => memo || panelOpen, false);

  configureNodeList = ({ dataSource, originNodeIds, ...nodeListOptions }) => {
    const {
      newNodeAttributes: {
        stageId,
        promptId,
      },
    } = this.props;

    const label = node => `${node.nickname}`;

    // external, needs to check list
    // otherwise check created at details.
    const accepts = (dataSource === 'existing') ?
      ({ meta }) => (
        meta.itemType === 'EXISTING_NODE' &&
        (meta.stageId !== stageId || meta.promptId !== promptId)
      ) :
      ({ meta }) => (
        meta.itemType === 'EXISTING_NODE' &&
        includes(originNodeIds, meta.uid)
      );

    return {
      ...nodeListOptions,
      onDrop: item => this.onDrop(item, dataSource),
      itemType: 'NEW_NODE',
      accepts,
      label,
    };
  }

  renderNodePanel = (panel, index) => {
    const {
      title,
      highlight,
      ...nodeListOptions
    } = panel;

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(highlight, index)}
        minimise={!this.panelIsOpen(index)}
      >
        <NodeList {...this.configureNodeList(nodeListOptions)} />
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

const getOriginNodeIds = ({ existingNodes, externalData, dataSource }) => (
  dataSource === 'existing' ?
    map(existingNodes, 'uid') :
    map(externalData[dataSource].nodes, 'uid')
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
        originNodeIds: getOriginNodeIds({
          existingNodes,
          externalData,
          dataSource: panel.dataSource,
        }),
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
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default compose(
  configurePanels,
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging']),
)(NodePanels);
