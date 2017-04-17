import React, { Component } from 'react';

class Pips extends Component {
  render() {

    const {
      count,
      currentIndex,
    } = this.props;

    return (
      <div className='pips'>
        <div className='pips__pips'>
          { [...Array(count).keys()].map((pip, index) => {
            const classes = currentIndex === index ? 'pips__pip pips__pip--active' : 'pips__pip';
            return <div key={ index } className={ classes }></div>;
          }) }
        </div>
      </div>
    );
  }
}

export default Pips;
