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
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { title, children, minimise, highlight } = this.props;

    const panelClasses = cx(
      'panel',
      { 'panel--minimise': minimise },
      { 'panel--collapsed': this.state.collapsed },
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
