import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, getFormMeta } from 'redux-form';
import { Button } from '../ui/components';
import { autoInitialisedForm } from '../behaviours';
import { Field } from '../containers/';
import { makeRehydrateFields } from '../selectors/forms';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  *
  * @param {func} autoPopulate(fields, values, autofill) Enables prepopulation of fields
  * based on field value changes. Called on change with current field values and meta,
  * and a callback to allow the setting of otherfields
  * @param {array} fields Contains an array of field definitions
  * see Field for detailed format of definitions:
  * {
  *   label: 'Name',
  *   name: 'name',
  *   type: 'Alphanumeric',
  *   placeholder: 'Name',
  *   validation: {
  *     required: true,
  *   }
  * }
  * @param {string} form The name of the form
  * @param {func} handleSubmit(data) Recieves data as jsonfrom a sucessful form submission
  *
  */
class Form extends Component {
  handleFieldBlur = () => {
    if (!this.props.autoPopulate) { return; }

    const {
      meta: {
        fields,
        values,
      },
      dirty,
      autofill,
    } = this.props;

    // if we don't check dirty state, this ends up firing and auto populating fields
    // when it shouldn't, like when closing the form
    if (dirty) {
      this.props.autoPopulate(fields, values, autofill);
    }
  };

  render() {
    const {
      autoFocus,
      fields,
      handleSubmit,
      controls,
      tooltip,
      className,
    } = this.props;

    return (
      <form className={className} onSubmit={handleSubmit} autoComplete="off">
        { fields.map((field, index) => {
          const isFirst = autoFocus && index === 0;
          return (
            <Field
              key={index}
              {...field}
              autoFocus={isFirst}
              onBlur={() => { this.handleFieldBlur(); }}
              tooltip={tooltip}
            />
          );
        }) }
        <div className="form__button-container">
          {controls.map(control => control)}
        </div>
      </form>
    );
  }
}

Form.propTypes = {
  autofill: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  autoPopulate: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  form: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  controls: PropTypes.array,
  className: PropTypes.string,
  tooltip: PropTypes.string,
};

Form.defaultProps = {
  autoFocus: false,
  autoPopulate: null,
  controls: [<Button key="submit" aria-label="Submit">Submit</Button>],
  className: null,
  tooltip: 'none',
};

function makeMapStateToProps() {
  const rehydrateFields = makeRehydrateFields();

  return function mapStateToProps(state, props) {
    return {
      meta: {
        fields: getFormMeta(props.form)(state),
        values: getFormValues(props.form)(state),
      },
      fields: rehydrateFields(state, props),
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
  autoInitialisedForm,
  reduxForm({
    touchOnChange: true,
    touchOnBlur: false,
  }),
)(Form);
