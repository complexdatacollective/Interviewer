import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ProgressBar } from '../components';

/**
  * Renders a card with details.
  */
class SessionCard extends PureComponent {
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
    );
  }
}

SessionCard.propTypes = {
  details: PropTypes.array,
  progress: PropTypes.number,
  label: PropTypes.string,
  selected: PropTypes.bool,
};

SessionCard.defaultProps = {
  details: [],
  progress: 0,
  label: '',
  selected: false,
};

export default SessionCard;

