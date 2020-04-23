import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from '@codaco/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../../config';

const ProtocolCard = (props) => {
  const {
    attributes,
    protocolUID,
  } = props;

  const {
    schemaVersion,
    lastModified,
    name,
    description,
  } = attributes;

  const isOutdatedProtocol = () =>
    schemaVersion !== APP_SCHEMA_VERSION &&
    APP_SUPPORTED_SCHEMA_VERSIONS.includes(schemaVersion);

  const isObsoleteProtocol = () => false; // To be implemented in future, as needed.

  const modifierClasses = cx(
    'protocol-card',
    { 'protocol-card--info': !isObsoleteProtocol() && isOutdatedProtocol() },
    { 'protocol-card--error': isObsoleteProtocol() },
  );

  const startButtonClasses = isObsoleteProtocol() ? ('start-button start-button--disabled') : ('start-button');

  const onClickProtocolCard = () => {
    setShowNewSessionOverlay(true);
    setSelectedProtocol(protocolUID);
  };

  const renderCardIcon = () => {
    if (isOutdatedProtocol()) {
      return (
        <div className="status-icon status-icon__info" onClick={() => handleSchemaOutdatedInfo}>
          <Icon name="info" />
        </div>
      );
    }

    if (isObsoleteProtocol()) {
      return (
        <div className="status-icon status-icon__error" onClick={() => handleSchemaObsoleteInfo}>
          <Icon name="error" />
        </div>
      );
    }

    return ('');
  };

  return (
    <div className={modifierClasses} onClick={onClickProtocolCard}>
      <div className="protocol-card__icon-section">
        <div className="protocol-icon">
          <Icon name="protocol-card" />
          {/* {renderCardIcon()} */}
        </div>
        <div className="protocol-meta">
          <h6>Installed: March 03, 19:46</h6>
          <h6>Last Used: March 03, 19:46</h6>
          <h6>Schema Version: 4</h6>
        </div>
      </div>
      <div className="protocol-card__main-section">
        <h1 className="protocol-name">{name}</h1>
        <p className="protocol-description">
          { description || (<em>No protocol description.</em>) }
        </p>
      </div>

    </div>
  );
};

ProtocolCard.defaultProps = {
  className: '',
  selectProtocol: () => {},
  description: null,
};

ProtocolCard.propTypes = {
  selectProtocol: PropTypes.func,
  openDialog: PropTypes.func.isRequired,
  deleteProtocol: PropTypes.func.isRequired,
  protocol: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    schemaVersion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    isSelected: uuid => state.selectedSessions && state.selectedSessions.includes(uuid),
    installedProtocols: state.installedProtocols,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    openDialog: dialogActions.openDialog,
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProtocolCard);

