import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Swiper from 'react-id-swiper';
import { size, map } from 'lodash';
import { NewSessionOverlay, ProtocolCard } from '../../components/Setup';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as importProtocolActions } from '../../ducks/modules/importProtocol';

/**
  * Display available protocols
  */
class ProtocolList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewSessionOverlay: false,
      selectedProtocol: null,
    };

    this.overlay = React.createRef();
  }
  onClickProtocolCard = (protocolUID) => {
    this.setState({
      showNewSessionOverlay: true,
      selectedProtocol: protocolUID,
    });
  }

  handleCreateSession = (caseId) => {
    this.props.addSession(caseId, this.state.selectedProtocol);
    this.handleCloseOverlay();

    // this.props.loadSession(protocol.path);
  }

  handleCloseOverlay = () => {
    this.setState({ showNewSessionOverlay: false, selectedProtocol: null });
  }

  render() {
    const {
      installedProtocols,
      // importProtocolStatus: {
      //   status,
      // },
    } = this.props;

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
        { size(installedProtocols) > 0 ?
          <Swiper {...params} ref={(node) => { if (node) this.swiper = node.swiper; }}>
            { map(installedProtocols, (protocol, uid) => (
              <div key={uid}>
                <ProtocolCard
                  protocol={protocol}
                  selectProtocol={() => this.onClickProtocolCard(uid)}
                />
              </div>
            )) }
          </Swiper>
          :
          <div className="protocol-list protocol-list--empty">
            <div className="protocol-list--empty getting-started">
              <h1>No interview protocols installed</h1>
              <p>
                To get started, install an interview protocol on this device. To do this,
                click the button in the bottom left to pair with an instance of Server,
                import a protocol from a URL, or add a local .netcanvas file.
              </p>
            </div>
          </div>
        }
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
  loadSession: PropTypes.func.isRequired,
  installedProtocols: PropTypes.object.isRequired,
};

ProtocolList.defaultProps = {
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
    importProtocolStatus: state.importProtocol,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionActions.addSession, dispatch),
    loadSession: bindActionCreators(sessionActions.loadSession, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    resetImportProtocol: bindActionCreators(importProtocolActions.resetImportProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolList);

export { ProtocolList as UnconnectedProtocolList };
