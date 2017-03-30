import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';

class NameGeneratorForm extends Component {
  renderTextField = ({ input, label, placeholder, required, meta: { touched, error }}) => {
    return (
      <input
        label={label}
        placeholder={placeholder}
        required={required}
        {...input} />
    );
  }

  fieldNames = ({ fields }) => {
    const { renderTextField } = this;

    return (
      <div>
        <ul className='names__list'>
          {fields.map((person, index) =>
            <li key={index}>
              {this.props.protocolForm.fields.map((item, idx) =>
                <Field
                  name={`${person}.${item.name}`}
                  type={item.type}
                  label={item.label}
                  placeholder={item.placeholder}
                  required={item.required}
                  component={renderTextField} />
              )}
            </li>
          )}
        </ul>
        <button
          type='button'
          onClick={() => fields.push({})}>
          {this.props.protocolForm.title}
        </button>
      </div>
    )
  }

  render() {
    const {
      props: {
        protocolForm,
        handleSubmit,
        submitButton
      }
    } = this;
    console.log(protocolForm)
    return (
      <form onSubmit={handleSubmit}>
        <FieldArray
          name={this.props.protocolForm.formName}
          component={this.fieldNames.bind(this)} />
        {submitButton}
      </form>
    )
  }
}

NameGeneratorForm.propTypes = {
  protocolForm: React.PropTypes.object
}

NameGeneratorForm = reduxForm({
  form: 'protocolForm',
  destroyOnUnmount: false,        // <------ preserve form data
  forceUnregisterOnUnmount: true  // <------ unregister fields on unmount
})(NameGeneratorForm);

export default NameGeneratorForm;
