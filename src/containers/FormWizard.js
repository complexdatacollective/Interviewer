import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'network-canvas-ui';
import { Pips } from '../components/';
import { Form } from '../containers/';

class FormWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldIndex: 0,
    };
  }

  onSubmit = (formData, dispatch, form) => {
    if (this.shouldShowNextButton()) {
      this.nextField();
      return;
    }
    this.props.onSubmit(formData, dispatch, form);
    this.setState({
      fieldIndex: 0,
    });
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

  shouldShowNextButton = () => {
    const showingLastField = this.state.fieldIndex === this.props.fields.length - 1;
    return !showingLastField;
  }

  currentField() {
    return [this.props.fields[this.state.fieldIndex]];
  }

  render() {
    const nextButton = (
      <button key="next" className="form__next-button" aria-label="Submit">
        <Icon name="form-arrow-right" />
      </button>
    );

    const formProps = {
      ...this.props,
      fields: this.currentField(),
      onSubmit: this.onSubmit,
    };

    return (
      <div className="form-wizard">
        <div className="form-wizard__pips">
          <Pips count={this.props.fields.length} currentIndex={this.state.fieldIndex} />
        </div>
        <div className="form-wizard__previous">
          {this.state.fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
        </div>
        <Form
          {...formProps}
          controls={this.shouldShowNextButton() ? [nextButton] : this.props.controls}
        />
      </div>
    );
  }
}

FormWizard.propTypes = {
  controls: PropTypes.array,
  fields: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

FormWizard.defaultProps = {
  controls: undefined,
};

export default FormWizard;
