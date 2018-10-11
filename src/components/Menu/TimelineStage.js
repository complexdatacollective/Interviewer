import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.OrdinalBin);

class TimelineStage extends Component {
  handleOpenStage = () => {
    const {
      protocolPath,
      sessionId,
      protocolType,
      index: stageIndex,
      openStage,
    } = this.props;

    const path = protocolPath ? `/session/${sessionId}/${protocolType}/${protocolPath}/${stageIndex}` : '/';
    openStage(path);
  }

  render() {
    const {
      item: { type, label },
    } = this.props;

    return (
      <div onClick={this.handleOpenStage} className="timeline-stage">
        <div className="timeline-stage__notch" />
        <div className="timeline-stage__preview">
          <img
            src={getTimelineImage(type)}
            alt="NameGenerator Interface"
            title="NameGenerator Interface"
          />
        </div>
        <div className="timeline-stage__label">{label}</div>
      </div>
    );
  }
}

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  protocolPath: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  protocolType: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  openStage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  protocolPath: state.protocol.path,
  protocolType: state.protocol.type,
  sessionId: state.session,
});

const mapDispatchToProps = dispatch => ({
  openStage: (path) => {
    dispatch(push(path));
    dispatch(uiActions.update({ isMenuOpen: false }));
  },
});

export { TimelineStage };

export default connect(mapStateToProps, mapDispatchToProps)(TimelineStage);
