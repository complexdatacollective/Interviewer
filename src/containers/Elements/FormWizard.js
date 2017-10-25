import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'network-canvas-ui';
import { Pips } from '../../components/Elements';
import { Form } from '.';

class FormWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldIndex: 0,
    };
  }

  onSubmit = (formData, dispatch, form) => {
    if (this.shouldShowNextField()) {
      this.nextField();
      return;
    }
    this.props.onSubmit(formData, dispatch, form);
  }

  nextField = () => {
    const count = this.props.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex + 1 + count) % count,
    });
  };

  previousField = () => {
    const count = this.props.fields.length;
    this.setState({
      fieldIndex: (this.state.fieldIndex - 1 + count) % count,
    });
  };

  shouldShowNextField = () => {
    const showingLastField = this.state.fieldIndex === this.props.fields.length - 1;
    return !showingLastField;
  }

  render() {
    const { fields, onSubmit, ...rest } = this.props;

    const extraProps = {};
    extraProps.fields = [fields[this.state.fieldIndex]];
    extraProps.onSubmit = this.onSubmit;
    if (this.shouldShowNextField()) {
      extraProps.submitComponent = (
        <button className="form__next-button" aria-label="Submit">
          <Icon name="form-arrow-right" />
        </button>
      );
    }

    return (
      <div>
        <div className="modal__pips">
          <Pips count={fields.length} currentIndex={this.state.fieldIndex} />
        </div>
        <div className="modal--mobile__previous">
          {this.state.fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
        </div>
        <Form
          {...rest}
          {...extraProps}
        />
      </div>
    );
  }
}

FormWizard.propTypes = {
  fields: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitComponent: PropTypes.object.isRequired,
};

export default FormWizard;
