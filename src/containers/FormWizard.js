import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@codaco/ui';
import { Pips } from '../components';
import { Form } from '.';

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
  }

  nextField = () => {
    const count = this.shownFields().length;
    this.setState({
      fieldIndex: (this.state.fieldIndex + 1 + count) % count,
    });
  };

  previousField = () => {
    const count = this.shownFields().length;
    this.setState({
      fieldIndex: (this.state.fieldIndex - 1 + count) % count,
    });
  };

  shouldShowNextButton = () => {
    const showingLastField = this.state.fieldIndex === this.shownFields().length - 1;
    return !showingLastField;
  }

  hiddenFields = () => this.props.fields.filter((field) => field.component === 'hidden');

  shownFields = () => this.props.fields.filter((field) => field.component !== 'hidden');

  filterFields = () => {
    if (this.state.fieldIndex === 0) {
      return [this.shownFields()[0]].concat(this.hiddenFields());
    }
    return [this.shownFields()[this.state.fieldIndex]];
  }

  render() {
    let nextButton = (
      <div className="form__button-container">
        <button key="next" className="form__next-button" aria-label="Submit">
          <Icon name="form-arrow-right" />
        </button>
      </div>
    );
    if (!this.shouldShowNextButton()) {
      nextButton = (
        <div className="form__button-container">
          <Button type="submit" key="submit" aria-label="Submit">Finished</Button>
        </div>
      );
    }

    const formProps = {
      ...this.props,
      fields: this.filterFields(),
      onSubmit: this.onSubmit,
    };

    return (
      <div className="form-wizard">
        <div className="form-wizard__pips">
          <Pips count={this.shownFields().length} currentIndex={this.state.fieldIndex} large />
        </div>
        <div className="form-wizard__previous">
          {this.state.fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
        </div>
        <Form
          {...formProps}
          submitButton={nextButton}
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
