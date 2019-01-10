import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { includes, map, differenceBy } from 'lodash';
import { networkNodes, makeNetworkNodesForOtherPrompts, makeGetAdditionalAttributes } from '../selectors/interface';
import { getExternalData } from '../selectors/externalData';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
import { makeGetPanelConfiguration, makeGetPromptNodeModelData } from '../selectors/name-generator';
import { Panel, Panels, NodeList } from '../components/';
import { getCSSVariableAsString } from '../ui/utils/CSSVariables';
import { MonitorDragSource } from '../behaviours/DragAndDrop';

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodePanels extends PureComponent {
  static propTypes = {
    isDragging: PropTypes.bool,
    meta: PropTypes.object,
    panels: PropTypes.array,
    prompt: PropTypes.object,
    newNodeAttributes: PropTypes.object.isRequired,
    removeNode: PropTypes.func.isRequired,
    stage: PropTypes.object,
    removeNodeFromPrompt: PropTypes.func.isRequired,
  };

  static defaultProps = {
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
    */
    if (dataSource === 'existing') {
      this.props.removeNodeFromPrompt(
        meta[nodePrimaryKeyProperty],
        this.props.prompt.id,
        this.props.newNodeAttributes,
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

    const colorPresets = [
      getCSSVariableAsString('--primary-color-seq-1'),
      getCSSVariableAsString('--primary-color-seq-2'),
      getCSSVariableAsString('--primary-color-seq-3'),
      getCSSVariableAsString('--primary-color-seq-4'),
      getCSSVariableAsString('--primary-color-seq-5'),
    ];

    const getHighlight = (panelNumber) => {
      if (panelNumber >= 0) { return colorPresets[panelNumber % colorPresets.length]; }
      return null;
    };

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(index)}
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

/**
 *
 * @param {array} nodes - all network nodes
 *
 */
const getNodesForDataSource = ({ sessionNodes, otherPromptNodes, externalData, dataSource }) => (
  dataSource === 'existing' ?
    otherPromptNodes :
    differenceBy(
      externalData[dataSource].nodes,
      sessionNodes,
      nodePrimaryKeyProperty,
    )
);

const getOriginNodeIds = ({ existingNodes, externalData, dataSource }) => (
  dataSource === 'existing' ?
    map(existingNodes, nodePrimaryKeyProperty) :
    map(externalData[dataSource] && externalData[dataSource].nodes, nodePrimaryKeyProperty)
);

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPanelConfiguration = makeGetPanelConfiguration();
  const getNetworkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();

  return function mapStateToProps(state, props) {
    const allNodes = networkNodes(state);
    const existingNodes = getNetworkNodesForOtherPrompts(state, props);
    const externalData = getExternalData(state);
    const newNodeAttributes = getPromptNodeAttributes(state, props);
    const newNodeModelData = makeGetPromptNodeModelData(state, props);

    const panels = getPanelConfiguration(state, props)
      .map((panel) => {
        const originNodeIds = getOriginNodeIds({
          existingNodes,
          externalData,
          dataSource: panel.dataSource,
        });

        const nodes = getNodesForDataSource({
          sessionNodes: allNodes,
          otherPromptNodes: existingNodes,
          externalData,
          dataSource: panel.dataSource,
        });

        const accepts = (panel.dataSource === 'existing') ?
          ({ meta }) => (
            meta.itemType === 'EXISTING_NODE' &&
            (meta.stageId !== newNodeModelData.stageId ||
              meta.promptIDs !== newNodeModelData.promptId)
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
      activePromptId: props.prompt.id,
      newNodeAttributes,
      panels,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    removeNodeFromPrompt: bindActionCreators(sessionsActions.removeNodeFromPrompt, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export { NodePanels };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(NodePanels);
