import React, { useState } from 'react';
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
const ProtocolList = (props) => {
  const {
    installedProtocols,
    activeSlideKey,
    importProtocolFromURI,
    addSession,
    updateProtocolIndex,
  } = props;

  const [showNewSessionOverlay, setShowNewSessionOverlay] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const onClickProtocolCard = (protocolUID) => {
    setShowNewSessionOverlay(true);
    setSelectedProtocol(protocolUID);
  };

  const handleCloseOverlay = () => {
    setShowNewSessionOverlay(false);
    setSelectedProtocol(null);
  };

  const handleCreateSession = (caseId) => {
    addSession(caseId, selectedProtocol);
    handleCloseOverlay();
  };

  const handleSwipe = (index) => {
    updateProtocolIndex(index);
  };

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
          getSwiper={(swiper) => {
            swiper.on('slideChange', () => { handleSwipe(swiper.activeIndex); });
          }}
        >
          { map(installedProtocolsArray, (protocol, index) => (
            <div key={index}>
              <ProtocolCard
                protocol={protocol}
                selectProtocol={() => onClickProtocolCard(protocol.uuid)}
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
            <p>Alternatively, click <a onClick={() => importProtocolFromURI('https://documentation.networkcanvas.com/protocols/Public%20Health%20Protocol%20schema%202.netcanvas')}>here</a> to download and install a sample public health protocol (requires network access).</p>
          </div>
        </div>
      }
      <NewSessionOverlay
        handleSubmit={handleCreateSession}
        onClose={handleCloseOverlay}
        show={showNewSessionOverlay}
      />
    </React.Fragment>
  );
};

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
