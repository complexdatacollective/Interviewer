import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colorDictionary } from 'network-canvas-ui';
import { differenceBy } from 'lodash';
import { createSelector } from 'reselect';
import { protocolData, networkNodes, makeOtherNetworkNodesWithStageNodeType } from '../../selectors/interface';
import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

const colorPresets = [
  colorDictionary['edge-alt-1'],
  colorDictionary['edge-alt-2'],
  colorDictionary['edge-alt-3'],
  colorDictionary['edge-alt-4'],
  colorDictionary['edge-alt-5'],
];

const panelPresets = {
  existing: {
    type: 'existing',
    title: 'People from your existing lists',
    source: 'existing',
    selectable: true,
    filter: network => network,
  },
  previous: {
    type: 'previous',
    title: 'People from your previous visit',
    source: 'previous',
    draggable: true,
    filter: network => network,
  },
};

const rehydratePreset = (panelConfig) => {
  // TODO: rehydrate looses methods, this puts a placehoder back in
  if (!panelConfig) { return () => true; }
  if (Object.prototype.hasOwnProperty.call(panelPresets, panelConfig)) {
    return panelPresets[panelConfig];
  }
  return panelConfig;
};

const propPanelConfigs = (_, props) => props.stage.params.panels;

const makeGetProviderConfigsWithNodes = () => {
  const otherNetworkNodesWithStageNodeType = makeOtherNetworkNodesWithStageNodeType();

  return createSelector(
    [propPanelConfigs, networkNodes, otherNetworkNodesWithStageNodeType, protocolData],
    (panelConfigs, nodes, existingNodes, data) => panelConfigs.map(rehydratePreset).map(
      (providerConfig) => {
        switch (providerConfig.source) {
          case 'existing':
            return { ...providerConfig, nodes: existingNodes };
          default:
            return {
              ...providerConfig,
              nodes: differenceBy(data[providerConfig.source].nodes, nodes, 'uid'),
            };
        }
      },
    ),
  );
};

const getHighlight = (provider, panelNumber) => {
  if (provider.highlight) { return provider.highlight; }
  if (panelNumber > 0) { return colorPresets[panelNumber % colorPresets.length]; }
  return null;
};

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
const NodeProviderPanels = ({ providerConfigsWithNodes, stage, prompt }) => {
  const totalNodes = providerConfigsWithNodes.reduce(
    (sum, providerConfig) => sum + providerConfig.nodes.length,
    0,
  );

  return (
    <Panels minimise={totalNodes === 0}>
      { providerConfigsWithNodes.map((providerConfig, panelNumber) => (
        <Panel
          title={providerConfig.title}
          key={providerConfig.type}
          minimise={providerConfig.nodes.length === 0}
          highlight={getHighlight(providerConfig, panelNumber)}
        >
          <NodeProvider {...providerConfig} stage={stage} prompt={prompt} />
        </Panel>
      )) }
    </Panels>
  );
};

NodeProviderPanels.propTypes = {
  providerConfigsWithNodes: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function makeMapStateToProps() {
  const getProviderConfigsWithNodes = makeGetProviderConfigsWithNodes();

  return function mapStateToProps(state, props) {
    return {
      providerConfigsWithNodes: getProviderConfigsWithNodes(state, props),
    };
  };
}

export default connect(makeMapStateToProps)(NodeProviderPanels);
