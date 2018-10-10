import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Scroller } from '../../components';
import { TimelineStage } from '.';

/**
  * Renders a menu, updating styles on DOM elements outside of this.
  * @extends Component
  */

// eslint-disable-next-line
 class Timeline extends Component {

  render() {
    const { items } = this.props;
    const menuItems = items.map(item =>
      (<TimelineStage item={item} key={item.id} />),
    );

    return (
      <div className="stages-timeline__timeline">
        <Scroller>
          { menuItems }
        </Scroller>
      </div>
    );
  }
}

Timeline.propTypes = {
  items: PropTypes.array.isRequired,
};

export default Timeline;
