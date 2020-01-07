import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@codaco/ui';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { ProgressBar } from '../components';

/**
  * Renders a card with details.
  */
class SessionCard extends PureComponent {
  onClickLoadSession = (event) => {
    event.preventDefault();
    this.props.setSession(this.props.sessionUUID);
  }

  render() {
    const {
      details,
      progress,
      label,
      selected,
    } = this.props;

    const attributes = details.map(
      (detail, index) => {
        const key = Object.keys(detail)[0];
        return (
          <h5 key={index} className={cx('session-card__attribute')}>
            {key}: {detail[key]}
          </h5>
        );
      },
    );

    const classes = cx({
      'session-card': true,
      'session-card--selected': selected,
    });
    return (
      <div className={classes}>
        <div className="session-card__content">
          <div className="progress-wrapper">
            <ProgressBar percentProgress={progress} />
            <h6>{progress}%</h6>
          </div>
          <div className="card__attributes">
            <h1 className="card__label">
              { label }
            </h1>
            { attributes }
          </div>
        </div>
        <Button
          color="neon-coral"
          onClick={this.onClickLoadSession}
        >Resume</Button>
      </div>
    );
  }
}

SessionCard.propTypes = {
  details: PropTypes.array,
  progress: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  sessionUUID: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  setSession: PropTypes.func.isRequired,
};

SessionCard.defaultProps = {
  details: [],
  selected: false,
};

function mapDispatchToProps(dispatch) {
  return {
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}
export default connect(null, mapDispatchToProps)(SessionCard);

