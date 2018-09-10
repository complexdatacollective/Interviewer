import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { includes, map, differenceBy } from 'lodash';
import { networkNodes, makeNetworkNodesForOtherPrompts } from '../selectors/interface';
import { getExternalData } from '../selectors/externalData';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
import { makeGetPromptNodeAttributes, makeGetPanelConfiguration } from '../selectors/name-generator';
import { Panel, Panels, NodeList } from '../components/';
import { getCSSVariableAsString } from '../utils/CSSVariables';
import { MonitorDragSource } from '../behaviours/DragAndDrop';

const colorPresets = [
  getCSSVariableAsString('--primary-color-seq-1'),
  getCSSVariableAsString('--primary-color-seq-2'),
  getCSSVariableAsString('--primary-color-seq-3'),
  getCSSVariableAsString('--primary-color-seq-4'),
  getCSSVariableAsString('--primary-color-seq-5'),
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
    activePromptAttributes: PropTypes.object,
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
    activePromptAttributes: {},
    isDragging: false,
    meta: {},
    panels: [],
    prompt: { id: null },
    stage: { id: null },
  };

  onDrop = ({ meta }, dataSource) => {
    /**
     * Handle a node being dropped into a panel
     *
     * If
    */
    if (dataSource === 'existing') {
      this.props.toggleNodeAttributes(
        meta[nodePrimaryKeyProperty],
        { ...this.props.activePromptAttributes },
      );
    } else {
      this.props.removeNode(meta[nodePrimaryKeyProperty]);
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
    differenceBy(externalData[dataSource].nodes, nodes, nodePrimaryKeyProperty)
);

const getOriginNodeIds = ({ existingNodes, externalData, dataSource }) => (
  dataSource === 'existing' ?
    map(existingNodes, nodePrimaryKeyProperty) :
    map(externalData[dataSource].nodes, nodePrimaryKeyProperty)
);

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();
  const getPanelConfiguration = makeGetPanelConfiguration();

  return function mapStateToProps(state, props) {
    const allNodes = networkNodes(state);
    const existingNodes = networkNodesForOtherPrompts(state, props);
    const externalData = getExternalData(state);
    const newNodeAttributes = getPromptNodeAttributes(state, props);

    const panels = getPanelConfiguration(state, props)
      .map((panel) => {
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
          ) : ({ meta }) => (
            meta.itemType === 'EXISTING_NODE' &&
            includes(originNodeIds, meta[nodePrimaryKeyProperty])
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
      newNodeAttributes,
      panels,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export { NodePanels };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(NodePanels);
