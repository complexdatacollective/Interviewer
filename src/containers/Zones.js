import React, { Component } from 'react';
import { connect } from 'react-redux';

class Zones extends Component {
  render() {
    return (
      <div className='zones'>
        { this.props.zones.map((zone, index) => {
          const styles = {
            width: zone.width,
            height: zone.height,
            top: zone.y,
            left: zone.x,
            position: 'absolute',
            background: 'rgba(0, 255, 50, 0.5)',
          };
          return (<div key={ index } style={ styles }></div>);
        }) };
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zones: state.droppable.zones,
  }
}

export default connect(mapStateToProps)(Zones);
