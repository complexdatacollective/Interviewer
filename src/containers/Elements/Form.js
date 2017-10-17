import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues, getFormMeta } from 'redux-form';
import { Button } from 'network-canvas-ui';
import { autoInitialisedForm } from '../../behaviours';
import { Field } from '../../containers/Elements';
import { makeRehydrateFields } from '../../selectors/rehydrate';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  *
  * @param {bool} addAnother tells whether or not there should be an "Add Another" button
  * @param {func} autoPopulate(fields, values, autofill) Enables prepopulation of fields
  * based on field value changes. Called on change with current field values and meta,
  * and a callback to allow the setting of otherfields
  * @param {func} continuousSubmit() handles continuous submission
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
  * @param {component} next An optional component to trigger the next field in a wizard
  * @param {component} previous An optional component to trigger the previous field in a wizard
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
      addAnother,
      autoFocus,
      continuousSubmit,
      fields,
      handleSubmit,
      next,
      normalSubmit,
      previous,
    } = this.props;

    const addAnotherButton = addAnother && !next
      ? <Button color="white" onClick={continuousSubmit} aria-label="Submit and add another node">Submit and New</Button>
      : null;

    return (
      <form onSubmit={handleSubmit}>
        {previous}
        { fields.map((field, index) => {
          const isFirst = autoFocus && index === 0;
          return (
            <Field
              key={field.name}
              {...field}
              autoFocus={isFirst}
              onBlur={() => { this.handleFieldBlur(); }}
            />
          );
        }) }
        <div className="form__button-container">
          {addAnotherButton}
          {next ?
            <button className="form__next-button" onClick={normalSubmit} aria-label="Submit">{next}</button> :
            <Button onClick={normalSubmit} aria-label="Submit">Submit</Button>
          }
        </div>
      </form>
    );
  }
}

Form.propTypes = {
  addAnother: PropTypes.bool,
  autofill: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  autoPopulate: PropTypes.func,
  continuousSubmit: PropTypes.func,
  dirty: PropTypes.bool.isRequired,
  form: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  next: PropTypes.object,
  normalSubmit: PropTypes.func,
  previous: PropTypes.object,
};

Form.defaultProps = {
  addAnother: false,
  autoFocus: false,
  autoPopulate: null,
  continuousSubmit: null,
  next: null,
  normalSubmit: null,
  previous: null,
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
    destroyOnUnmount: false, // need this false to make it validate across wizard
    enableReinitialize: true,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
  }),
)(Form);
