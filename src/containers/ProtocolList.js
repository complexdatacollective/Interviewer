import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Swiper from 'react-id-swiper';

import ProtocolCard from '../components/Setup/ProtocolCard';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';

/**
  * Display available protocols
  */
class ProtocolList extends Component {
  onClickNewProtocol = (protocol) => {
    if (!(protocol.type || protocol.path)) {
      console.log('protocol type and path not valid for:');
      console.log(protocol);
      return;
    }

    if (protocol.type === 'factory') {
      this.loadFactoryProtocol(protocol.path);
    } else {
      this.importRemoteProtocol(protocol.path);
    }
  }

  loadFactoryProtocol = (protocolPath) => {
    this.props.addSession();
    this.props.loadFactoryProtocol(protocolPath);
  }

  loadRemoteProtocol = (protocolPath) => {
    if (protocolPath) {
      this.props.addSession();
      this.props.loadProtocol(protocolPath);
    }
  }


  render() {
    const { protocols } = this.props;
    const params = {
      containerClass: 'protocol-list swiper-container',
      pagination: {
        el: '.swiper-pagination.protocol-list__pagination',
        type: 'bullets',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: true,
    };

    return (
      <Swiper {...params}>
        { protocols.map(protocol => (
          <div key={protocol.path}>
            <ProtocolCard
              size="large"
              protocol={protocol}
              selectProtocol={() => this.onClickNewProtocol(protocol)}
            />
          </div>
        )) }
      </Swiper>
    );
  }
}

ProtocolList.propTypes = {
  addSession: PropTypes.func.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  protocols: PropTypes.array.isRequired,
};

ProtocolList.defaultProps = {
};

function mapStateToProps(state) {
  return {
    protocols: state.protocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolList);
