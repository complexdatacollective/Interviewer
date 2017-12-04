/* eslint-disable */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { has, map } from 'lodash';
import { Panels } from '../../components/Elements';
import NodePanel from './NodePanel';

const panelPresets = {
  existing: {
    title: 'Already mentioned',
    dataSource: 'existing',
    interaction: 'draggable',
    acceptsDraggableType: 'EXISTING_NODE',
    filter: network => network,
  },
  external: {
    title: 'People from your previous visit',
    dataSource: 'previousInterview',
    interaction: 'draggable',
    filter: network => network,
  },
};

const rehydratePreset = (panelConfig) => {
  if (has(panelPresets, panelConfig)) {
    return panelPresets[panelConfig];
  }
  return panelConfig;
};

const propPanelConfigs = (_, props) => props.stage.panels;

const getPanelConfigs = createSelector(
  propPanelConfigs,
  panelConfigs => map(panelConfigs, rehydratePreset),
);

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodeProviderPanels extends PureComponent {
  renderNodePanels() {
    return this.props.panels.map(this.renderNodePanel);
  }

  renderNodePanel = (panel, index) => {
    const { prompt, stage } = this.props;

    return (
      <NodePanel
        {...panel}
        index={index}
        prompt={prompt}
        stage={stage}
      />
    );
  }

  render() {
    return (
      <Panels>
        {this.renderNodePanels()}
      </Panels>
    );
  }
}

NodeProviderPanels.propTypes = {
  panels: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
  return {
    panels: getPanelConfigs(state, props),
  };
}

export default connect(mapStateToProps)(NodeProviderPanels);
