/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  actionCreators as modalActions,
} from '../../ducks/modules/modals';
import { Form } from '../../containers/Elements';

/**
  * Quiz Interface
  * @extends Component
  */
class Quiz extends Component {

  onSubmit = (formData) => {
    if (formData) {
      alert('success');
      console.log(formData);
    } else {
      alert('fail');
    }
  }

  render() {

    const {
      form,
    } = this.props.config.params;

    return (
      <div className="form-interface">
        <h1>Quiz</h1>

        <Form
          form={form.name}
          fields={form.fields}
          onSubmit={this.onSubmit}
        />
      </div>
    );
  }
}

Quiz.propTypes = {
  config: PropTypes.object.isRequired,
};

export default Quiz;
