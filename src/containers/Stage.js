import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';
import loadInterface from '../utils/loadInterface';
import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stage } from '../selectors/session';
import styles from '../ui/styles';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  onClickNext = () => {
    this.props.next();
  }

  // change the stage to the previous
  onClickBack = () => {
    this.props.previous();
  }

  render() {
    const { currentStage } = this.props;
    const CurrentInterface = loadInterface(currentStage.type);

    return (
      <CSSTransitionGroup
        transitionName="stage--transition"
        transitionEnterTimeout={styles.animation.duration.slow * 2}
        transitionLeaveTimeout={styles.animation.duration.slow}
        transitionAppear
        transitionAppearTimeout={styles.animation.duration.slow}
      >
        <div className="stage" key={currentStage.id}>
          <div className="stage__control">
            <button
              className="stage__control-button stage__control-button--back"
              onClick={this.onClickBack}
            >
              Back
            </button>
          </div>
          <div className="stage__interface">
            { CurrentInterface &&
              <CurrentInterface config={currentStage} />
            }
          </div>
          <div className="stage__control">
            <button
              className="stage__control-button stage__control-button--next"
              onClick={this.onClickNext}
            >
              Next
            </button>
          </div>
        </div>
      </CSSTransitionGroup>
    );
  }
}

Stage.propTypes = {
  currentStage: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  previous: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const currentStage = stage(state);

  return {
    currentStage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(stageActions.next, dispatch),
    previous: bindActionCreators(stageActions.previous, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);
