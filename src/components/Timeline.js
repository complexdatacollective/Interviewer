import React, { PureComponent } from 'react';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import { Icon } from '../ui/components';
import { ProgressBar } from '../components';
import { DropObstacle } from '../behaviours/DragAndDrop';

class Timeline extends PureComponent {
  render() {
    const {
      onClickBack,
      onClickNext,
      percentProgress,
    } = this.props;

    return (
      <div className="timeline">
        <div className="timeline-nav timeline-nav--back">
          <Icon
            onClick={(e) => {
              if (e) {
                e.stopPropagation();
                e.preventDefault();
              }
              onClickBack(e);
            }}
            name="chevron-up"
          />
        </div>
        <ProgressBar percentProgress={percentProgress} />
        <div
          className="timeline-nav timeline-nav--next"
          onClick={(e) => {
            if (e) {
              e.stopPropagation();
              e.preventDefault();
            }
            onClickNext(e);
          }}
        >
          <Icon name="chevron-down" />
        </div>
      </div>
    );
  }
}

Timeline.propTypes = {
  onClickBack: PropTypes.func,
  onClickNext: PropTypes.func,
  percentProgress: PropTypes.number,
};

Timeline.defaultProps = {
  onClickBack: () => {},
  onClickNext: () => {},
  percentProgress: 0,
};

export { Timeline };

export default compose(
  DropObstacle,
)(Timeline);
