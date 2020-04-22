import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { isEmpty, get } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@codaco/ui';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { ProgressBar } from '../components';
import { nodeAttributesProperty } from '../utils/network-exporters/graphml/helpers';

const displayDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const SessionCard = (props) => {
  const {
    setSession,
    attributes,
    sessionUUID,
    installedProtocols,
    isSelected,
  } = props;

  const {
    caseId,
    network,
    promptIndex,
    protocolUID,
    stageIndex,
    updatedAt,
  } = attributes;

  const classes = cx({
    'session-card': true,
    'session-card--selected': isSelected(sessionUUID),
  });


  // const attributes = details.map(
  //   (detail, index) => {
  //     const key = Object.keys(detail)[0];
  //     return (
  //       <h5 key={index} className={cx('session-card__attribute')}>
  //         {key}: {detail[key]}
  //       </h5>
  //     );
  //   },
  // );

  const progress = Math.round(
    (oneBasedIndex(stageIndex) / oneBasedIndex(get(installedProtocols, [protocolUID, 'stages'], []).length)) * 100,
  );

  console.log(props);
  return (
    <div className={classes}>
      <div className="session-card__content">
        <div className="progress-wrapper">
          <ProgressBar percentProgress={progress} />
          <h6>{progress}%</h6>
        </div>
        <div className="card__attributes">
          <h1 className="card__label">
            { caseId }
          </h1>
          {/* { attributes } */}
        </div>
      </div>
      <Button
        color="neon-coral"
        onClick={(e) => { e.preventDefault(); setSession(sessionUUID); }}
      >
        Resume
      </Button>
    </div>
  );
};

SessionCard.propTypes = {
  attributes: PropTypes.object.isRequired,
  sessionUUID: PropTypes.string.isRequired,
  setSession: PropTypes.func.isRequired,
};

SessionCard.defaultProps = {
};

function mapStateToProps(state) {
  return {
    isSelected: uuid => state.selectedSessions && state.selectedSessions.includes(uuid),
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SessionCard);

