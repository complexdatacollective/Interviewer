import React from 'react';
import PropTypes from 'prop-types';
import Scroller from '../../components/Scroller';
import TimelineStage from '../../containers/MainMenu/TimelineStage';

const Timeline = ({ items }) => {
  const menuItems = items.map((item, index) =>
    (<TimelineStage item={item} key={item.id} index={index} />),
  );

  return (
    <div className="stages-timeline__timeline">
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
