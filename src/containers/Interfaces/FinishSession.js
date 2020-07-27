import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';

import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import Scroller from '../../components/Scroller';

class FinishSession extends Component {
  constructor() {
    super();
    this.state = {
      showExportSessionOverlay: false,
      deleteAfterFinish: false,
    };
  }

  handleFinishSession = () => {
    if (this.state.deleteAfterFinish) {
      this.props.openDialog({
        type: 'Warning',
        title: 'Finish and delete?',
        confirmLabel: 'Finish and delete',
        onConfirm: () => this.props.endSession(this.state.deleteAfterFinish, true),
        message: (
          <React.Fragment>
            <p>
              You have the &quot;Delete this session after finishing&quot; option enabled.
              Continuing will delete this interview session, regardless of if you have uploaded or
              exported it.
            </p>
            <p>Are you sure you want to continue?</p>
          </React.Fragment>
        ),
      });
    } else {
      this.props.endSession(this.state.deleteAfterFinish, true);
    }
  };

  handleToggleDelete = () =>
    this.setState({ deleteAfterFinish: !this.state.deleteAfterFinish });
  render() {
    return (
      <div className="interface finish-session-interface">
        <div className="finish-session-interface__frame">
          <h1 className="finish-session-interface__title type--title-1">
            Finish Interview
          </h1>
          <Scroller>
            <div className="finish-session-interface__section finish-session-interface__section--instructions">
              <p>
                You have reached the end of the interview.
                If you are satisfied with the information you have entered, you may finish the
                interview now.
              </p>
            </div>
            <Toggle
              input={{
                value: this.state.deleteAfterFinish,
                onChange: this.handleToggleDelete,
              }}
              label="Delete this session after finishing?"
              fieldLabel=" "
            />

          </Scroller>
          <div className="finish-session-interface__section finish-session-interface__section--buttons">
            <Button onClick={this.handleFinishSession}>
              Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

FinishSession.propTypes = {
  endSession: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  deleteSession: sessionsActions.removeSession,
  endSession: sessionActions.endSession,
  openDialog: dialogActions.openDialog,
};

export default connect(null, mapDispatchToProps)(FinishSession);

export { FinishSession as UnconnectedFinishSession };
