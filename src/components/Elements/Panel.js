import React from 'react';
import PropTypes from 'prop-types';

const Panel = (props) => {
  const {
    title,
    children,
  } = props;

  return (
    <div className="panel">
      <div className="panel__heading"><h5>{title}</h5></div>
      <div className="panel__content">
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
};

Panel.defaultProps = {
  title: '',
  children: null,
};

export default Panel;
