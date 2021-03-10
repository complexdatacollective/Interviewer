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
    const { onSubmit } = this.props;
    if (this.shouldShowNextButton()) {
      this.nextField();
      return;
    }
    onSubmit(formData, dispatch, form);
  }

  nextField = () => {
    const { fieldIndex } = this.state;
    const count = this.shownFields().length;
    this.setState({
      fieldIndex: (fieldIndex + 1 + count) % count,
    });
  };

  previousField = () => {
    const { fieldIndex } = this.state;
    const count = this.shownFields().length;
    this.setState({
      fieldIndex: (fieldIndex - 1 + count) % count,
    });
  };

  shouldShowNextButton = () => {
    const { fieldIndex } = this.state;
    const showingLastField = fieldIndex === this.shownFields().length - 1;
    return !showingLastField;
  }

  hiddenFields = () => {
    const { fields } = this.props;
    return fields.filter((field) => field.component === 'hidden');
  };

  shownFields = () => {
    const { fields } = this.props;
    return fields.filter((field) => field.component !== 'hidden');
  };

  filterFields = () => {
    const { fieldIndex } = this.state;
    if (fieldIndex === 0) {
      return [this.shownFields()[0]].concat(this.hiddenFields());
    }
    return [this.shownFields()[fieldIndex]];
  }

  render() {
    const { fieldIndex } = this.state;

    let nextButton = (
      <div className="form__button-container">
        <button
          key="next"
          className="form__next-button"
          aria-label="Submit"
          type="submit"
        >
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
          <Pips count={this.shownFields().length} currentIndex={fieldIndex} large />
        </div>
        <div className="form-wizard__previous">
          {fieldIndex !== 0 && <Icon name="form-arrow-left" onClick={this.previousField} />}
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
