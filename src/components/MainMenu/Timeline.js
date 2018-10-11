import React from 'react';
import PropTypes from 'prop-types';
import { Scroller } from '../../components';
import TimelineStage from '../../containers/MainMenu/TimelineStage';

const Timeline = ({ items }) => {
  const menuItems = items.map((item, index) =>
    (<TimelineStage item={item} key={item.id} index={index} />),
  );

  return (
    <div className="stages-timeline__timeline">
      <Scroller>
        { menuItems }
      </Scroller>
    </div>
  );
};

Timeline.propTypes = {
  items: PropTypes.array.isRequired,
};

export default Timeline;
