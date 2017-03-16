import React, { Component } from 'react';
import { reduxForm, Field, FieldArray } from 'redux-form';

import { Input, Form, Card, Button, Icon } from 'semantic-ui-react';

class NameGeneratorForm extends Component {
  renderTextField = ({ input, label, meta: { touched, error }}) => {
    return (
      <Input label={label} {...input} />
    );
  }

  fieldNames = ({ fields }) => {
    const { renderTextField } = this;
    return (
      <div>
        <ul className='names__list'>
          {fields.map((name, index) =>
            <li key={index}>
              <Card className='names__card'>
                <Card.Header className='names__card-header'>
                  <Icon
                    link
                    color='red'
                    name='close'
                    onClick={() => fields.remove(index)}/>
                </Card.Header>
                <Card.Content>
                  <Field
                    name={`${name}.fName`}
                    component={renderTextField} />
                </Card.Content>
              </Card>
            </li>
          )}
        </ul>
        <Button
          type='button'
          className='button--add'
          content='Add a name'
          icon='add circle'
          labelPosition='left'
          onClick={() => fields.push({})} />
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
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <FieldArray
            name={fieldName}
            component={this.fieldNames.bind(this)} />
        </Form.Field>
        {submitButton}
      </Form>
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
