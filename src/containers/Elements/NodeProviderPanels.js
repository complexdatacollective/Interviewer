import React, { Component } from 'react';

import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

const providerPresets = {
  'existing': { },
  'previous': { },
}

const getProviderConfig = (provider) => {
  if(!provider) { return () => { return true; } }  // TODO: rehydrate looses methods, this puts a placehoder back in
  if(providerPresets.hasOwnProperty(provider)) { return providerPresets[provider]; }
  return provider;
}

class NodeProviderPanels extends Component {
  render() {
    const {
      config,
    } = this.props;

    const panels = config.map((panel, index) => {
      const providerConfig = getProviderConfig(panel);

      return (
        <Panel title={ panel.title } key={ index }>
          <NodeProvider config={ providerConfig } />
        </Panel>
      );
    });

    return (
      <Panels>
        { panels }
      </Panels>
    );
  }
}
export default NodeProviderPanels;
