import React from 'react';
import PropTypes from 'prop-types';

const Panel = (props) => {
  const {
    title,
    children,
  } = props;

  return (
    <div className="panel">
      <div className="panel__heading"><h3>{title}</h3></div>
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
