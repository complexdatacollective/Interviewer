import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
/**
  * Renders a side panel, with a title and `props.children`.
  */

const Panel = ({ title, children, minimise, highlight }) => {
  const panelClasses = cx(
    'panel',
    { 'panel--minimise': minimise },
  );

  const styles = { borderColor: highlight };

  return (
    <div className={panelClasses} style={styles}>
      <div className="panel__heading"><h3 className="panel__heading-header">{title}</h3></div>
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
  highlight: PropTypes.string,
};

Panel.defaultProps = {
  title: '',
  children: null,
  minimise: false,
  highlight: null,
};

export default Panel;
