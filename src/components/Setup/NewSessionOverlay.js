import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Overlay from '../../containers/Overlay';
import { Button } from '../../ui/components';
import { Text } from '../../ui/components/Fields';

class NewSessionOverlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      caseID: '',
    };

    this.overlay = React.createRef();
  }

  handleUpdateCaseID(value) {
    this.setState({ caseID: value });
  }

  render() {
    const { show, handleSubmit, onClose } = this.props;

    return (
      <Overlay
        show={show}
        title="Enter a Case ID"
        ref={this.overlay}
        onClose={onClose}
      >
        <p>
          Before the interview begins, enter a case ID.
          This will be shown on the resume interview screen to help you quickly
          identify this session.
        </p>
        <Text
          input={{
            value: this.state.caseID,
            onChange: e => this.handleUpdateCaseID(e.target.value),
          }}
          autoFocus
          label="Case ID"
          fieldLabel=" "
        />
        <Button key="submit" aria-label="Submit" onClick={() => handleSubmit(this.state.caseID)}>Start Interview</Button>
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
