import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';

class NameGeneratorForm extends Component {
  renderTextField = ({ input, label, placeholder, required }) => {
    return (
      <div>
        <label>{label}</label>
        <input
          type="text"
          placeholder={placeholder}
          {...input}
        />
      </div>
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
                  key={idx}
                  name={`${person}.${item.name}`}
                  label={item.label}
                  placeholder={item.placeholder}
                  component={renderTextField}
                />
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

    return (
      <form onSubmit={handleSubmit}>
        <FieldArray
          name={protocolForm.formName}
          component={this.fieldNames.bind(this)}
        />
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
