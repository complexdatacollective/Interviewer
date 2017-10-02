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
  * @param {func} handleSubmit(data) Recieves data as jsonfrom a sucessful form submission
  * @param {func} autoPopulate(fields, values, autofill) Enables prepopulation of fields
  * based on field value changes. Called on change with current field values and meta,
  * and a callback to allow the setting of otherfields
  * @param {func} continuousSubmit() handles continuous submission
  * @param {bool} addAnother tells whether or not there should be an "Add Another" button
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
      autofill,
    } = this.props;

    this.props.autoPopulate(fields, values, autofill);
  };

  render() {
    const {
      fields,
      handleSubmit,
      addAnother,
      continuousSubmit,
      normalSubmit,
      autoFocus,
    } = this.props;

    const addAnotherButton = addAnother
      ? <Button type="button" color="white" onClick={continuousSubmit} accessibityLabel="Submit and add another node">Submit and New</Button>
      : null;

    return (
      <form onSubmit={handleSubmit}>
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
          <Button onClick={normalSubmit}>Submit</Button>
        </div>
      </form>
    );
  }
}

Form.propTypes = {
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  autofill: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  autoPopulate: PropTypes.func,
  autoFocus: PropTypes.bool,
  addAnother: PropTypes.bool,
  continuousSubmit: PropTypes.func,
  normalSubmit: PropTypes.func,
};

Form.defaultProps = {
  autoFocus: false,
  addAnother: false,
  autoPopulate: null,
  continuousSubmit: null,
  normalSubmit: null,
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
    destroyOnUnmount: true,
    forceUnregisterOnUnmount: true,
  }),
)(Form);
