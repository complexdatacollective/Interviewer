import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Icon } from '../../ui/components';

class Accordion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  toggleAccordion = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const toggleClasses = cx(
      'accordion__toggle',
      { 'accordion__toggle--open': this.state.open },
    );

    return (
      <div className="accordion">
        <div
          className={toggleClasses}
          onClick={this.toggleAccordion}
        >
          <h4>{this.props.label}</h4>
          <Icon
            name="chevron-up"
            color="white"
            className="accordion__icon accordion__icon--open"
          />
          <Icon
            name="chevron-down"
            color="white"
            className="accordion__icon accordion__icon--close"
          />
        </div>
        {this.state.open &&
          <div>
            {this.props.children}
          </div>
        }
      </div>
    );
  }
}

Accordion.propTypes = {
  children: PropTypes.object,
  label: PropTypes.string,
  open: PropTypes.bool,
};

Accordion.defaultProps = {
  children: null,
  label: '',
  open: false,
};

export default Accordion;
