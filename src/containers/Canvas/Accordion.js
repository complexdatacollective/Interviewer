import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from '@codaco/ui';

class Accordion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
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
      <div className="accordion" onClick={this.props.onAccordionToggle}>
        <div
          className={toggleClasses}
          onClick={this.toggleAccordion}
        >
          <h4>{this.props.label}</h4>
&nbsp;
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
        {this.state.open
          && (
          <div className="accordion__content">
            {this.props.children}
          </div>
          )}
      </div>
    );
  }
}

Accordion.propTypes = {
  children: PropTypes.array,
  label: PropTypes.string,
  onAccordionToggle: PropTypes.func.isRequired,
};

Accordion.defaultProps = {
  children: null,
  label: '',
};

export default Accordion;
