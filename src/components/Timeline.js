import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Icon } from '../ui/components';
import { ProgressBar } from '../components';
import { DropObstacle } from '../behaviours/DragAndDrop';
import { actionCreators as uiActions } from '../ducks/modules/ui';

class Timeline extends PureComponent {
  render() {
    const {
      onClickBack,
      onClickNext,
      percentProgress,
      toggleMenu,
    } = this.props;

    return (
      <div className="timeline" onClick={toggleMenu}>
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
  toggleMenu: PropTypes.bool.isRequired,
};

Timeline.defaultProps = {
  onClickBack: () => {},
  onClickNext: () => {},
  percentProgress: 0,
};

const mapDispatchToProps = dispatch => ({
  toggleMenu: () => dispatch(uiActions.toggle('isMenuOpen')),
});

export { Timeline };

export default compose(
  connect(null, mapDispatchToProps),
  DropObstacle,
)(Timeline);
