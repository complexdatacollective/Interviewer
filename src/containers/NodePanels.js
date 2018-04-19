import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { includes, map, differenceBy } from 'lodash';
import { getNodeLabelFunction, networkNodes, makeNetworkNodesForOtherPrompts } from '../selectors/interface';
import { getExternalData } from '../selectors/protocol';
import { actionCreators as networkActions } from '../ducks/modules/network';
import { makeGetPromptNodeAttributes } from '../selectors/name-generator';
import { Panel, Panels, NodeList } from '../components/';
import { getCSSVariableAsString } from '../utils/CSSVariables';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import configurePanels from '../behaviours/configurePanels';

const colorPresets = [
  getCSSVariableAsString('--edge-alt-1'),
  getCSSVariableAsString('--edge-alt-2'),
  getCSSVariableAsString('--edge-alt-3'),
  getCSSVariableAsString('--edge-alt-4'),
  getCSSVariableAsString('--edge-alt-5'),
];

const getHighlight = (highlight, panelNumber) => {
  if (panelNumber > 0) { return colorPresets[panelNumber % colorPresets.length]; }
  return null;
};

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodePanels extends PureComponent {
  static propTypes = {
    activePromptAttributes: PropTypes.object.isRequired,
    getLabel: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    meta: PropTypes.object,
    panels: PropTypes.array,
    prompt: PropTypes.object,
    newNodeAttributes: PropTypes.object.isRequired,
    removeNode: PropTypes.func.isRequired,
    stage: PropTypes.object,
    toggleNodeAttributes: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isDragging: false,
    meta: {},
    panels: [],
    prompt: { id: null },
    stage: { id: null },
  };

  onDrop = ({ meta }, dataSource) => {
    if (dataSource === 'existing') {
      this.props.toggleNodeAttributes(meta.uid, { ...this.props.activePromptAttributes });
    } else {
      this.props.removeNode(meta.uid);
    }
  }

  isPanelEmpty = index => this.props.panels[index].nodes.length === 0;

  isPanelCompatible = index => this.props.panels[index].accepts({ meta: this.props.meta });

  isPanelOpen = index =>
    (this.props.isDragging && this.isPanelCompatible(index)) || !this.isPanelEmpty(index);

  isAnyPanelOpen = () =>
    this.props.panels
      .map((panel, index) => this.isPanelOpen(index))
      .reduce((memo, panelOpen) => memo || panelOpen, false);

  renderNodePanel = (panel, index) => {
    const stageId = this.props.stage.id;
    const promptId = this.props.prompt.id;

    const {
      title,
      highlight,
      dataSource,
      ...nodeListProps
    } = panel;

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(highlight, index)}
        minimise={!this.isPanelOpen(index)}
      >
        <NodeList
          listId={`PANEL_NODE_LIST_${stageId}_${promptId}_${index}`}
          id={`PANEL_NODE_LIST_${index}`}
          {...nodeListProps}
          label={this.props.getLabel}
          itemType="NEW_NODE"
          onDrop={item => this.onDrop(item, dataSource)}
        />
      </Panel>
    );
  }

  render() {
    return (
      <Panels minimise={!this.isAnyPanelOpen()}>
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
    const allNodes = networkNodes(state);
    const existingNodes = networkNodesForOtherPrompts(state, props);
    const externalData = getExternalData(state);
    const newNodeAttributes = getPromptNodeAttributes(state, props);

    const panels = props.panels.map((panel) => {
      const originNodeIds = getOriginNodeIds({
        existingNodes,
        externalData,
        dataSource: panel.dataSource,
      });

      const nodes = getNodesForDataSource({
        nodes: allNodes,
        existingNodes,
        externalData,
        dataSource: panel.dataSource,
      });

      const accepts = (panel.dataSource === 'existing') ?
        ({ meta }) => (
          meta.itemType === 'EXISTING_NODE' &&
          (meta.stageId !== newNodeAttributes.stageId ||
            meta.promptId !== newNodeAttributes.promptId)
        ) :
        ({ meta }) => (
          meta.itemType === 'EXISTING_NODE' &&
          includes(originNodeIds, meta.uid)
        );

      return {
        ...panel,
        originNodeIds,
        nodes,
        accepts,
      };
    });

    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      getLabel: getNodeLabelFunction(state),
      newNodeAttributes,
      panels,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export { NodePanels };

export default compose(
  configurePanels,
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(NodePanels);
