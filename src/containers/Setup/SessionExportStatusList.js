import React, { PureComponent } from 'react';
import { map, pick } from 'lodash';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Scroller from '../../components/Scroller';
import { Spinner, Icon } from '../../ui/components';

class SessionExportStatusList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const sessionsCopy = Object.assign({}, this.props.sessions);
    this.sessionsCopy = sessionsCopy;
  }

  render() {
    const { sessions, sessionsToExport, deleteWhenFinished } = this.props;
    console.log(sessionsToExport);
    const activeSessions = pick(sessions, sessionsToExport);

    return (
      <Scroller className="session-export-status-list">
        { map(activeSessions, (session, sessionUUID) => {
          const isError = session.exportStatus === 'error';
          const isExporting = session.exportStatus === 'exporting';
          const isFinished = session.exportStatus === 'finished';

          const icon = () => {
            if (isError) {
              return (<Icon name="warning" />);
            }

            if (isExporting) {
              return (<Spinner />);
            }

            if (isFinished) {
              return (<Icon name="tick" />);
            }

            return (<Icon name="menu-new-session" />);
          };

          const errorDetail = (error) => {
            if (error.code === 409) {
              return 'Session already exists on Server. To upload again, first remove this session from within Server.';
            }

            return error.friendlyMessage;
          };

          return (
            <div
              className={cx('session-export-item', { 'session-export-item--to-delete': isFinished && deleteWhenFinished })}
              key={sessionUUID}
            >
              <div className="session-export-item__icon">{icon()}</div>
              <div className="session-export-item__content">
                <h4>{session.caseId}</h4>
                { isFinished && <div className="info-box">Successfully exported.</div>}
                { isError && <div className="error-box">{errorDetail(session.exportError)}</div> }
              </div>
            </div>
          );
        })}
      </Scroller>
    );
  }
}

SessionExportStatusList.propTypes = {
  sessions: PropTypes.object.isRequired,
  sessionsToExport: PropTypes.array.isRequired,
  deleteWhenFinished: PropTypes.bool,
};

SessionExportStatusList.defaultProps = {
  deleteWhenFinished: false,
};

const mapStateToProps = state => ({
  sessions: state.sessions,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionExportStatusList);
