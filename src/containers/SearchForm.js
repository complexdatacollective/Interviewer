import React, { PropTypes } from 'react';
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
const SearchForm = ({ searchValue }) => (
  <Form onSubmit={() => {}}>
    <Field name="searchTerm" value={searchValue} component={autocompleteInput} type="text" />
  </Form>
);

SearchForm.defaultProps = {
  searchValue: '',
};

SearchForm.propTypes = {
  searchValue: PropTypes.string,
};

export default compose(reduxForm({ form: 'search' }))(SearchForm);
