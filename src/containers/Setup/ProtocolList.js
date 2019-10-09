import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Swiper from 'react-id-swiper';
import { size, map } from 'lodash';
import { Icon } from '../../ui/components';
import { NewSessionOverlay, ProtocolCard } from '../../components/Setup';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as importProtocolActions } from '../../ducks/modules/importProtocol';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

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
    this.swiper = null;
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
  }

  handleCloseOverlay = () => {
    this.setState({ showNewSessionOverlay: false, selectedProtocol: null });
  }

  handleSwipe = (index) => {
    this.props.updateProtocolIndex(index);
  }

  render() {
    const {
      installedProtocols,
      activeSlideKey,
    } = this.props;

    const params = {
      containerClass: 'protocol-list swiper-container',
      pagination: {},
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      renderPrevButton: () => <Icon className="swiper-button-prev" name="form-arrow-left" />,
      renderNextButton: () => <Icon className="swiper-button-next" name="form-arrow-right" />,
      loop: false,
      slidesPerView: 'auto',
      centeredSlides: true,
      shouldSwiperUpdate: true,
      initialSlide: activeSlideKey,
    };

    const installedProtocolsArray =
      Object.keys(installedProtocols).map(
        protocol => ({ ...installedProtocols[protocol], uuid: protocol }));

    return (
      <React.Fragment>
        { size(installedProtocols) > 0 ?
          <Swiper
            {...params}
            ref={(node) => {
              if (node) {
                this.swiper = node.swiper;
                node.swiper.on('slideChange', () => { this.handleSwipe(node.swiper.activeIndex); });
              }
            }}
          >
            { map(installedProtocolsArray, (protocol, index) => (
              <div key={index}>
                <ProtocolCard
                  protocol={protocol}
                  selectProtocol={() => this.onClickProtocolCard(protocol.uuid)}
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
                click the button in the bottom right to pair with an instance of Server,
                import a protocol from a URL, or add a local .netcanvas file.
              </p>
              <p>Alternatively, click <a onClick={() => this.props.importProtocolFromURI('https://documentation.networkcanvas.com/protocols/Public%20Health%20Protocol.netcanvas')}>here</a> to download and install a sample public health protocol (requires network access).</p>
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
    activeSlideKey: state.ui.protocolIndex,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionActions.addSession, dispatch),
    loadSession: bindActionCreators(sessionActions.loadSession, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    importProtocolFromURI:
      bindActionCreators(importProtocolActions.importProtocolFromURI, dispatch),
    resetImportProtocol: bindActionCreators(importProtocolActions.resetImportProtocol, dispatch),
    updateProtocolIndex: (index) => {
      dispatch(uiActions.update({
        protocolIndex: index,
      }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolList);

export { ProtocolList as UnconnectedProtocolList };
