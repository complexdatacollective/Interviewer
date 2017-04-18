import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Panel } from '../Elements';

const filterPresets = {
  'existing': () => { return true; },
  'previous': () => { return true; },
}

const getFilter = (filter) => {
  if(!filter) { return () => { return true; } }  // TODO: rehydrate looses methods, this puts a placehoder back in
  if(filterPresets.hasOwnProperty(filter)) { return filterPresets[filter]; }
  return filter;
}

class Panels extends Component {

  render() {
    const {
      panels,
      nodes,
      handleDrag,
      handleSelect,
    } = this.props;

    const panelItems = panels.map((panel, index) => {
      const panelNodes = nodes.filter(getFilter(panel.filter));

      return (
        <div className='panels__panel' key={ index }>
          <Panel { ...panel } nodes={ panelNodes } handleSelect={ handleSelect } handleDrag={ handleDrag } />
        </div>
      );
    });

    return (
      <div className='panels'>
        { panelItems }
      </div>
    );
  }
}

Panels.defaultProps = {
  network: {
    nodes: [],
  }
};

function mapStateToProps(state) {
  return {
    network: state.network
  }
}

export default connect(mapStateToProps)(Panels);
