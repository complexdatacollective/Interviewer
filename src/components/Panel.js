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
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const noTitle = !title || title.length === 0;

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => !value);
  }, [setCollapsed]);

  const panelClasses = cx(
    'panel',
    { 'panel--minimize': minimize },
    { 'panel--collapsed': collapsed },
    { 'panel--no-title': noTitle },
  );

  const styles = { borderColor: highlight };

  return (
    <div className={panelClasses} style={styles}>
      { !noTitle && (
        <div className="panel__heading" onClick={toggleCollapsed}>
          <h3 className="panel__heading-header">{title}</h3>
        </div>
      )}
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
};

Panel.defaultProps = {
  title: '',
  children: null,
  minimize: false,
  highlight: null,
};

export default Panel;
