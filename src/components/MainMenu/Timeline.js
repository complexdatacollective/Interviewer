import React from 'react';
import PropTypes from 'prop-types';
import Scroller from '../Scroller';
import TimelineStage from '../../containers/MainMenu/StagesMenu/TimelineStage';

const Timeline = ({ items }) => {
  console.log('TIMELINE', items);
  const menuItems = items.map((item, index) =>
    (<TimelineStage item={item} key={item.id} index={index} />),
  );

  return (
    <div className="main-menu-timeline">
      {menuItems.length > 0 ? (
        <Scroller>
          { menuItems }
        </Scroller>
      ) : (
        <p>No stages to display.</p>
      )}
    </div>
  );
};

Timeline.propTypes = {
  items: PropTypes.array.isRequired,
};

export default Timeline;
