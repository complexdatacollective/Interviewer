/* eslint-disable */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { reduxForm, Form, Field } from 'redux-form';
import { TextInput } from 'network-canvas-ui'

const autocompleteInput = field => <TextInput {...field.input} />;

/**
 * Redux-form to handle plaintext search with autocomplete.
 * @extends Component
 */
class SearchForm extends Component {
  render() {
    return (
      <Form onSubmit={() => {}}>
        <Field name="searchTerm" component={autocompleteInput} type="text" />
      </Form>
    )
  }
}

export default compose(reduxForm({form: 'search'}))(SearchForm);
