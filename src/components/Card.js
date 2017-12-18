import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a card with details.
  */
const Card = (props) => {
  const {
    details,
    label,
    selected,
  } = props;

  const attributes = Object.entries(details).map(
    ([key, value]) => (
      <h5 key={key} className="card__attribute">
        {key}: {value}
      </h5>
    ),
  );

  const classes = cx({
    card: true,
    'card--selected': selected,
  });

  return (
    <div className={classes}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 100 100"
        className="card__indicator"
      >
        <g>
          <path d="M100,50c0,27.6-22.4,50-50,50s-50-22.4-50-50S22.5,0,50,0S100,22.4,100,50z M50,8.3C27,8.3,8.4,27,8.4,50S27,91.6,50,91.6 S91.7,73,91.7,50S73,8.3,50,8.3z" />
          <polygon points="30.8,43 45.3,57.2 69,32.1 77.4,40.6 46.3,73.8 22.7,51.6" />
        </g>
      </svg>

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
};

Card.propTypes = {
  details: PropTypes.object,
  label: PropTypes.string,
  selected: PropTypes.bool,
};

Card.defaultProps = {
  details: {},
  label: '',
  selected: false,
};

export default Card;

