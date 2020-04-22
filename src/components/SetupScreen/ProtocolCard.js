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
    schemaVersion,
    lastModified,
    name,
    protocolUID,
    description,
  } = props;

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
        <div className="protocol-card__info" onClick={() => handleSchemaOutdatedInfo}>
          <Icon name="info" />
        </div>
      );
    }

    if (isObsoleteProtocol()) {
      return (
        <div className="protocol-card__error" onClick={() => handleSchemaObsoleteInfo}>
          <Icon name="error" />
        </div>
      );
    }

    return ('');
  };

  return (
    <div className={modifierClasses} onClick={onClickProtocolCard}>
      <div className="protocol-card__delete" onClick={() => { handleDeleteProtocol() }}>
        <Icon name="delete" />
      </div>
      {renderCardIcon()}
      <h2 className="protocol-card__name">{name}</h2>
      <p className="protocol-card__description">
        { description ?
          description : (<em>No protocol description.</em>)}
      </p>
      <div
        className={startButtonClasses}
        data-clickable="start-interview"
        onClick={() => selectProtocol(protocol)}
      >
        <Icon className="start-button__protocol-icon" name="protocol-card" />
        <div className="start-button__text">Start new interview</div>
        <Icon className="start-button__arrow" name="chevron-right" />
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

