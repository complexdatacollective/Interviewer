import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a card with details.
  */
class SessionCard extends PureComponent {
  render() {
    const {
      details,
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
        <div>
          <h1 className="card__label">
            { label }
          </h1>
          <div className="card__attributes">
            { attributes }
          </div>
        </div>
      </div>
    );
  }
}

SessionCard.propTypes = {
  details: PropTypes.array,
  label: PropTypes.string,
  selected: PropTypes.bool,
};

SessionCard.defaultProps = {
  details: [],
  label: '',
  selected: false,
};

export default SessionCard;

