import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';
import { motion } from 'framer-motion';
import cx from 'classnames';
import Pips from '@codaco/ui/lib/components/Prompts/Pips';
import Form from './Form';

const NavigationButton = ({
  icon, left, right, onClickHandler,
}) => {
  const classes = cx(
    'wizard-navigation-button',
    {
      'wizard-navigation-button--left': left,
      'wizard-navigation-button--right': right,
    },
  );

  const variants = {
    hidden: {
      x: left ? '-100%' : '100%',
    },
    show: {
      x: 0,
    },
  };

  return (
    <motion.div
      className={classes}
      onTap={onClickHandler}
      variants={variants}
      initial="hidden"
      animate="show"
    >
      <Icon name={icon} />
    </motion.div>
  );
};

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
      <button
        key="next"
        className="form__next-button"
        aria-label="Next"
        type="submit"
      >
        <NavigationButton right icon="chevron-right" />
      </button>
    );

    if (!this.shouldShowNextButton()) {
      nextButton = (
        <button
          className="form__next-button"
          type="submit"
          key="submit"
          aria-label="Finished"
        >
          <NavigationButton right icon="tick" />
        </button>
      );
    }

    const formProps = {
      ...this.props,
      fields: this.filterFields(),
      onSubmit: this.onSubmit,
    };

    return (
      <div className="form-wizard">
        <div className="form-wizard__previous">
          {fieldIndex !== 0 && <NavigationButton left onClickHandler={this.previousField} icon="chevron-left" />}
        </div>
        <Form
          {...formProps}
          submitButton={nextButton}
        />
        <div className="form-wizard__pips">
          <Pips count={this.shownFields().length} currentIndex={fieldIndex} />
        </div>
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
