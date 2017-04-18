import React, { Component } from 'react';
import { NodeList } from '../../components/Elements';

const label = (node) => {
  return node.name;
}

class Panel extends Component {
  handleDrag = (e) => {
    console.log('drag', e);
    this.props.handleDrag();
  }

  handleTap = (e) => {
    console.log('tap', e);
    this.props.handleSelect();
  }

  render() {
    const {
      title,
      nodes,
    } = this.props;

    return (
      <div className='panel'>
        <h5>{ title }</h5>
        <NodeList nodes={ nodes } label={ label } handleDrag={ this.handleDrag } handleTap={ this.handleTap } />
      </div>
    );
  }
}

export default Panel;
