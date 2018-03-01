import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import getInterface from '../containers/Interfaces';
import { getNextStageIndex, getPreviousStageIndex } from '../selectors/session';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  onClickNext = () => {
    this.props.changeStage(`${this.props.pathPrefix}/${this.props.nextIndex}`);
  }

  // change the stage to the previous
  onClickBack = () => {
    this.props.changeStage(`${this.props.pathPrefix}/${this.props.previousIndex}`);
  }

  render() {
    const { config } = this.props;
    const CurrentInterface = getInterface(config.type);

    return (
      <div className="stage">
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
            <CurrentInterface stage={config} />
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
    );
  }
}

Stage.propTypes = {
  changeStage: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  nextIndex: PropTypes.number.isRequired,
  pathPrefix: PropTypes.string,
  previousIndex: PropTypes.number.isRequired,
};

Stage.defaultProps = {
  pathPrefix: '',
};

function mapStateToProps(state) {
  return {
    nextIndex: getNextStageIndex(state),
    previousIndex: getPreviousStageIndex(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeStage: path => dispatch(push(path)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);
