import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../../config';

const ProtocolCard = (props) => {
  const {
    attributes,
    protocolUID,
    onClickHandler,
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
    <div className={modifierClasses} onClick={() => onClickHandler(protocolUID)}>
      <div className="protocol-card__icon-section">
        <div className="protocol-icon">
          <Icon name="protocol-card" />
        </div>
        <div className="protocol-meta">
          <h6>Installed: March 03, 19:46</h6>
          <h6>Last Used: March 03, 19:46</h6>
          <h6>Schema Version: 4</h6>
        </div>
      </div>
      <div className="protocol-card__main-section">
        <h1 className="protocol-name">{name} {renderCardIcon()}</h1>
        <p className="protocol-description">
          { description || (<em>No protocol description.</em>) }
        </p>
      </div>
    </div>
  );
};

ProtocolCard.defaultProps = {
  className: '',
  onClickHandler: () => {},
  description: null,
};

ProtocolCard.propTypes = {
  onClickHandler: PropTypes.func,
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
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProtocolCard);

