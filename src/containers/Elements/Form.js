/* eslint-disable */
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reduxForm, actions, getFormValues, getFormMeta } from 'redux-form';
import { autoInitialisedForm } from '../../behaviors';
import { Field } from '../../containers/Elements';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
class Form extends Component {

  handleFieldBlur = () => {
    if(!this.props.autoPopulate) { return; }

    const {
      meta: {
        fields,
        values,
      },
      autofill,
    } = this.props;

    this.props.autoPopulate(fields, values, autofill);
  }

  render() {
    const { fields, handleSubmit, ...rest } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        { fields.map((field, index) => (
          <Field key={field.name} {...field} onBlur={() => { this.handleFieldBlur() }} />
        )) }
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
};

Form.propTypes = {
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    meta: {
      fields: getFormMeta(ownProps.form)(state),
      values: getFormValues(ownProps.form)(state),
    },
  };
}

export default compose(
  connect(mapStateToProps),
  autoInitialisedForm,
  reduxForm({
    destroyOnUnmount: true,
    forceUnregisterOnUnmount: true,
  }),
)(Form)
