import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';

class NameGeneratorForm extends Component {
  renderTextField = ({ input, label, meta: { touched, error }}) => {
    return (
      <input label={label} {...input} />
    );
  }

  fieldNames = ({ fields }) => {
    const { renderTextField } = this;
    return (
      <div>
        <ul className='names__list'>
          {fields.map((name, index) =>
            <li key={index}>
              <Field
                name={`${name}.fName`}
                component={renderTextField} />
            </li>
          )}
        </ul>
        <button
          type='button'
          onClick={() => fields.push({})}>
          Add a name
        </button>
      </div>
    )
  }

  render() {
    const {
      props: {
        fieldName,
        handleSubmit,
        submitButton
      }
    } = this;

    return (
      <form onSubmit={handleSubmit}>
        <FieldArray
          name={fieldName}
          component={this.fieldNames.bind(this)} />
        {submitButton}
      </form>
    )
  }
}

NameGeneratorForm.propTypes = {
  fieldName: React.PropTypes.string,
  fieldLabel: React.PropTypes.string,
  multiple: React.PropTypes.bool
}

NameGeneratorForm = reduxForm({
  form: 'protocolForm',
  destroyOnUnmount: false,        // <------ preserve form data
  forceUnregisterOnUnmount: true  // <------ unregister fields on unmount
})(NameGeneratorForm);

export default NameGeneratorForm;
