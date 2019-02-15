import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Swiper from 'react-id-swiper';
import { NewSessionOverlay, ProtocolCard } from '../../components/Setup';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

/**
  * Display available protocols
  */
class ProtocolList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewSessionOverlay: false,
      protocol: {
        name: 12,
      },
    };

    this.overlay = React.createRef();
  }
  onClickNewProtocol = (protocol) => {
    if (!(protocol.isFactoryProtocol || protocol.path)) {
      return;
    }

    this.setState({
      showNewSessionOverlay: true,
      protocol,
    });
  }

  handleCreateSession = (caseId) => {
    this.props.addSession(caseId, this.state.protocol.name);
    this.handleCloseOverlay();

    // this.props.loadSession(protocol.path);
  }

  handleCloseOverlay = () => {
    this.setState({ showNewSessionOverlay: false });
  }

  render() {
    const { installedProtocols } = this.props;
    const params = {
      containerClass: 'protocol-list swiper-container',
      pagination: {
        el: '.swiper-pagination.protocol-list__pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next.swiper-button-white',
        prevEl: '.swiper-button-prev.swiper-button-white',
      },
      on: {
        slideChange: this.handleSwipe,
      },
      loop: false,
      shouldSwiperUpdate: true,
      rebuildOnUpdate: true,
      slidesPerView: 'auto',
      centeredSlides: true,
    };

    return (
      <React.Fragment>
        <Swiper {...params} ref={(node) => { if (node) this.swiper = node.swiper; }}>
          { installedProtocols.map(protocol => (
            <div key={protocol.path}>
              <ProtocolCard
                size="large"
                protocol={protocol}
                selectProtocol={() => this.onClickNewProtocol(protocol)}
              />
            </div>
          )) }
        </Swiper>
        <NewSessionOverlay
          handleSubmit={this.handleCreateSession}
          onClose={this.handleCloseOverlay}
          show={this.state.showNewSessionOverlay}
        />
      </React.Fragment>
    );
  }
}

ProtocolList.propTypes = {
  addSession: PropTypes.func.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadSession: PropTypes.func.isRequired,
  installedProtocols: PropTypes.array.isRequired,
};

ProtocolList.defaultProps = {
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionActions.addSession, dispatch),
    loadSession: bindActionCreators(sessionActions.loadSession, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolList);

export { ProtocolList as UnconnectedProtocolList };
