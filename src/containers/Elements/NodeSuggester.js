import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Panels, Panel, NodeList } from '../../components/Elements';

const filterPresets = {
  'existing': () => { return true; },
  'previous': () => { return true; },
}

const getFilter = (filter) => {
  if(!filter) { return () => { return true; } }  // TODO: rehydrate looses methods, this puts a placehoder back in
  if(filterPresets.hasOwnProperty(filter)) { return filterPresets[filter]; }
  return filter;
}

class NodeSuggester extends Component {
  render() {
    const {
      config,
      network,
    } = this.props;

    const panels = config.map((panel, index) => {
      const nodes = network.nodes.filter(getFilter(panel.filter));

      return (
        <Panel title={ panel.title } key={ index }>
          <NodeList nodes={ nodes } label={ node => node.name } />
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

function mapStateToProps(state) {
  return {
    network: state.network,
  }
}

export default connect(mapStateToProps)(NodeSuggester);
