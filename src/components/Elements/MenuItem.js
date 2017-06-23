import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'network-canvas-ui';

/**
  * Renders a menu item. Image is based on interfaceType.
  */
class MenuItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false,
    };
  }

  mouseOver = () => {
    this.setState({ hover: true });
  }

  mouseOut = () => {
    this.setState({ hover: false });
  }

  render() {
    const { onClick, interfaceType, isActive, menuType, title } = this.props;

    const itemClasses = classNames(
      'menu__menuitem',
      {
        'menu__menuitem--active': isActive,
      },
      `menu__menuitem--${menuType}`,
    );

    return (
      <a
        onClick={onClick}
        className={itemClasses}
        tabIndex={0}
        role="menuitem"
        onMouseOver={this.mouseOver}
        onMouseOut={this.mouseOut}
      >
        <Icon name={interfaceType} color={this.state.hover || isActive ? '' : menuType} />
        {title}
      </a>
    );
  }
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  interfaceType: PropTypes.string,
  isActive: PropTypes.bool,
  menuType: PropTypes.string,
  title: PropTypes.string.isRequired,
};

MenuItem.defaultProps = {
  interfaceType: '',
  isActive: false,
  menuType: 'primary',
};

export default MenuItem;
