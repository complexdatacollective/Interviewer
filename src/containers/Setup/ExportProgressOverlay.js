import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spinner, Button, Icon } from '@codaco/ui';
import { ProgressBar, Scroller } from '../../components';
import { actionCreators as exportSessionActions } from '../../ducks/modules/exportProcess';

class ExportProgressOverlay extends Component {
  constructor(props) {
    super(props);

    this.overlay = React.createRef();
  }

  handleUpdateCaseID(value) {
    this.setState({ caseId: value });
  }

  render() {
    const {
      progress,
      statusText,
      errors,
      sessionExportReset,
      abort,
    } = this.props;

    const iconName = errors.length > 0 ? 'warning' : 'tick';

    const renderErrors = () => {
      const errorList = errors.map((error, index) => (<li key={index}><Icon name="warning" /> {error.message}</li>));
      return (
        <React.Fragment>
          <h2>Export finished with errors.</h2>
          <p>
            Your export completed, but non-fatal errors were encountered during the process. This
            may mean that not all sessions or all formats were able to be exported.
            Review the details of these errors below, and ensure that you check the data you
            received.
          </p>
          <h4>Errors:</h4>
          <Scroller>
            <ul className="error-list">{errorList}</ul>
          </Scroller>
        </React.Fragment>
      );
    };

    const renderStatus = () => (
      <div className="progress-container">
        <h2>{statusText}</h2>
        <ProgressBar orientation="horizontal" percentProgress={progress} />
      </div>
    );

    return (
      <React.Fragment>
        <div className="export-progress-overlay">
          <div className="export-progress-overlay__icon">
            { progress === 100 ? (
              <Icon name={iconName} />
            ) : (
              <Spinner />
            )}
          </div>
          <div className="export-progress-overlay__content" ref={this.contentRef}>
            { errors.length > 0 && progress === 100 ? renderErrors() : renderStatus()}
          </div>
        </div>
        <div className="export-progress-footer">
          { progress === 100 ? (
            <Button onClick={sessionExportReset}>Continue</Button>
          ) : (
            <Button
              color="platinum"
              onClick={() => {
                abort();
                sessionExportReset();
              }}
            >Cancel</Button>
          )}
        </div>
      </React.Fragment>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sessionExportReset: bindActionCreators(exportSessionActions.sessionExportReset, dispatch),
  };
}
const mapStateToProps = state => ({
  progress: state.exportProcess.progress,
  statusText: state.exportProcess.statusText,
  errors: state.exportProcess.errors,
});

ExportProgressOverlay.propTypes = {
  progress: PropTypes.number.isRequired,
  statusText: PropTypes.string.isRequired,
  errors: PropTypes.array.isRequired,
  sessionExportReset: PropTypes.func.isRequired,
  abort: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ExportProgressOverlay);
