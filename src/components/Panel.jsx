import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
  * Renders a side panel, with a title and `props.children`.
  */
const Panel = ({
  title,
  children,
  minimize,
  highlight,
  noHighlight,
  noCollapse,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = useCallback(() => {
    if (noCollapse) { return; }
    setCollapsed((value) => !value);
  }, [setCollapsed, noCollapse]);

  const panelClasses = cx(
    'panel',
    {
      'panel--no-highlight': noHighlight,
      'panel--minimize': minimize,
      'panel--collapsed': collapsed,
    },
  );

  const styles = { borderColor: highlight };

  return (
    <div className={panelClasses} style={styles}>
      <div className="panel__heading" onClick={toggleCollapsed}>
        <h3 className="panel__heading-header">{title}</h3>
      </div>
      <div className="panel__content">
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  minimize: PropTypes.bool,
  highlight: PropTypes.string,
  noHighlight: PropTypes.bool,
  noCollapse: PropTypes.bool,
};

Panel.defaultProps = {
  title: '',
  children: null,
  minimize: false,
  highlight: null,
  noHighlight: false,
  noCollapse: false,
};

export default Panel;
