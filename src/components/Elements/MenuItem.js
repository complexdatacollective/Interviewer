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
    const { onClick, interfaceType, title, isActive } = this.props;

    const itemClasses = classNames(
      'menu__menuitem',
      {
        'menu__menuitem--active': isActive,
      },
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
        <Icon name={interfaceType} color={this.state.hover || isActive ? '' : 'primary'} />
        {title}
      </a>
    );
  }
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  interfaceType: PropTypes.string,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

MenuItem.defaultProps = {
  interfaceType: '',
  isActive: false,
};

export default MenuItem;
