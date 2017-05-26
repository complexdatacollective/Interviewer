/* eslint-disable */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  actionCreators as modalActions,
} from '../../ducks/modules/modals';
import { Form } from '../../components/Elements';
import { Modal } from '../../containers/Elements';

const QUIZ_MODAL = 'QUIZ_MODAL';

/**
  * Quiz Interface
  * @extends Component
  */
class Quiz extends Component {

  onSubmit = (formData) => {
    if (formData) {
      console.log(formData);
    }
  }

  render() {
    const {
      openModal,
    } = this.props;

    const {
      form,
    } = this.props.config.params;

    return (
      <div className="form-interface">
        <h1>Quiz</h1>

        <Modal name={QUIZ_MODAL} title="QUIZ">
          hi
        </Modal>

        <Form
          fields={form.fields}
          handleSubmit={this.onSubmit}
        />

        <br />

        <button onClick={() => openModal(QUIZ_MODAL)}>
          Answer Quiz
        </button>
      </div>
    );
  }
}

Quiz.propTypes = {
  config: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(Quiz);
