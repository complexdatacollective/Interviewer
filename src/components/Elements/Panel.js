import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a side panel, with a title and `props.children`.
  */
const Panel = ({ title, children, minimise }) => {
  const panelClasses = cx(
    'panel',
    { 'panel--minimise': minimise },
  );
  return (
    <div className={panelClasses}>
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
  minimise: PropTypes.bool,
};

Panel.defaultProps = {
  title: '',
  children: null,
  minimise: false,
};

export default Panel;
