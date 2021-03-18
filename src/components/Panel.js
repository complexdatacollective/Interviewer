import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
/**
  * Renders a side panel, with a title and `props.children`.
  */

class Panel extends Component {
  constructor() {
    super();

    this.state = { collapsed: false };
  }

  toggleCollapsed = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  };

  render() {
    const {
      title,
      children,
      minimize,
      highlight,
    } = this.props;
    const { collapsed } = this.state;

    const panelClasses = cx(
      'panel',
      { 'panel--minimize': minimize },
      { 'panel--collapsed': collapsed },
    );

    const styles = { borderColor: highlight };

    return (
      <div className={panelClasses} style={styles}>
        <div className="panel__heading" onClick={this.toggleCollapsed}>
          <h3 className="panel__heading-header">{title}</h3>
        </div>
        <div className="panel__content">
          {children}
        </div>
      </div>
    );
  }
}

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
