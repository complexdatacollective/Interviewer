import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
/**
  * Renders a side panel, with a title and `props.children`.
  */

const Panel = ({ title, children, minimise, highlight, highlightName }) => {
  const panelSubClasses = {
    'panel--minimise': minimise,
  };
  panelSubClasses[highlightName] = highlight;
  const panelClasses = cx(
    'panel',
    panelSubClasses,
  );
  return (
    <div className={panelClasses}>
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
  highlight: PropTypes.bool,
  highlightName: PropTypes.string,
};

Panel.defaultProps = {
  title: '',
  children: null,
  minimise: false,
  highlight: false,
  highlightName: '',
};

export default Panel;
