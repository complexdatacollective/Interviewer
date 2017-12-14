import React from 'react';
import { compose } from 'redux';
import { reduxForm, Form, Field } from 'redux-form';
import { TextInput } from 'network-canvas-ui';

const autocompleteInput = field => <TextInput {...field.input} />;

/**
 * Redux-form to handle plaintext search with autocomplete.
 * Attributes are passed to the input field.
 *
 * @extends Component
 */
const SearchForm = () => (
  <Form onSubmit={() => {}}>
    <Field name="searchTerm" component={autocompleteInput} type="text" />
  </Form>
);

export default compose(reduxForm({ form: 'search' }))(SearchForm);
