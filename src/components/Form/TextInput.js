import React, { Component } from 'react';
import { Field } from 'redux-form';
import classnames from 'classnames';
import { required } from '../../utils/Validations';

class TextInput extends Component {

  textField = (field) => {
    return (
      <label className={ classnames('input', 'input--text', { 'input--active': field.meta.active }) }>
        <input className="input__field" type="text" placeholder={ this.props.label } {...field.input} />
        <div className="input__label">{ this.props.label }</div>
        {field.meta.touched && field.meta.error &&
          <div className="input__error">{field.meta.error}</div>}
      </label>
    );
  }

  render() {
    return (
      <Field name={ this.props.name } component={ this.textField } validate={[ required ]}/>
    );
  }
}

export default TextInput;
