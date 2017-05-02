import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Pips extends Component {
  render() {

    const {
      count,
      currentIndex,
    } = this.props;

    let pips = [];

    for (let index = 0; index < count; index++) {
      const classes = (currentIndex === index ? 'pips__pip pips__pip--active' : 'pips__pip');
      pips.push(<div key={ index } className={ classes }></div>);
    };

    return (
      <div className='pips'>
        <div className='pips__pips'>
          { pips }
        </div>
      </div>
    );
  }
}

Pips.propTypes = {
  count: PropTypes.number,
  currentIndex: PropTypes.number,
};

export default Pips;
