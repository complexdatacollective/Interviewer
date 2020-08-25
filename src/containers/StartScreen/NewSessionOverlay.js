import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
import Overlay from '../../containers/Overlay';
import { Form } from '../../containers';


class NewSessionOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      caseID: '',
    };

    this.overlay = React.createRef();
  }

  onSubmitForm = (fields) => {
    this.props.handleSubmit(fields.case_id);
  }

  render() {
    const { show, onClose } = this.props;

    const formConfig = {
      formName: 'case-id-form',
      fields: [
        {
          label: null,
          name: 'case_id',
          component: 'Text',
          placeholder: 'Enter a unique case ID',
          validation: {
            required: true,
            maxLength: 30,
          },
        },
      ],
    };

    return (
      <Overlay
        show={show}
        title="Enter a Case ID"
        onClose={onClose}
        forceDisableFullScreen
      >
        <div className="case-id-form">
          <p>
            Before the interview begins, enter a case ID.
            This will be shown on the resume interview screen to help you quickly
            identify this session.
          </p>
          <Form
            className="case-id-form__form"
            form={formConfig.formName}
            autoFocus
            onSubmit={this.onSubmitForm}
            {...formConfig}
          >
            <div className="case-id-form__footer">
              <Button aria-label="Submit" type="submit">
                Start interview
              </Button>
            </div>
          </Form>
        </div>
      </Overlay>
    );
  }
}

NewSessionOverlay.propTypes = {
  show: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

NewSessionOverlay.defaultProps = {
  show: false,
  onClose: () => {},
};

export default NewSessionOverlay;
