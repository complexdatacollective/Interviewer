import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';
import { createSelector } from 'reselect';
import { protocolData } from '../../selectors/protocolData';
import { networkNodes, otherNetworkNodesWithStageNodeType } from '../../selectors/network';
import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

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

const propPanelConfigs = (_, props) => props.config.params.panels;

const getProviderConfigsWithNodes = createSelector(
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

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
const NodeProviderPanels = ({ providerConfigsWithNodes, config, prompt }) => {
  const totalNodes = providerConfigsWithNodes.reduce(
    (sum, providerConfig) => sum + providerConfig.nodes.length,
    0,
  );

  return (
    <Panels minimise={totalNodes === 0}>
      { providerConfigsWithNodes.map(providerConfig => (
        <Panel
          title={providerConfig.title}
          key={providerConfig.type}
          minimise={providerConfig.nodes.length === 0}
        >
          <NodeProvider {...providerConfig} config={config} prompt={prompt} />
        </Panel>
      )) }
    </Panels>
  );
};

NodeProviderPanels.propTypes = {
  providerConfigsWithNodes: PropTypes.array.isRequired,
  config: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
  return {
    providerConfigsWithNodes: getProviderConfigsWithNodes(state, props),
  };
}

export default connect(mapStateToProps)(NodeProviderPanels);
