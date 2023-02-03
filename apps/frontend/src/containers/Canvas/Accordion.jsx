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
    const { open } = this.state;
    this.setState({
      open: !open,
    });
  }

  render() {
    const { open } = this.state;
    const {
      onAccordionToggle,
      label,
      children,
    } = this.props;

    const toggleClasses = cx(
      'accordion__toggle',
      { 'accordion__toggle--open': open },
    );

    return (
      <div className="accordion" onClick={onAccordionToggle}>
        <div
          className={toggleClasses}
          onClick={this.toggleAccordion}
        >
          <h4>{label}</h4>
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
        {open
          && (
          <div className="accordion__content">
            {children}
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
