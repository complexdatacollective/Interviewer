import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../../config';

const formatDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const ProtocolCard = (props) => {
  const {
    attributes,
    protocolUID,
    onClickHandler,
    openDialog,
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

  const handleSchemaOutdatedInfo = () => {
    openDialog({
      type: 'Notice',
      title: 'Schema can be updated',
      canCancel: false,
      message: (
        <React.Fragment>
          <p>
            This protocol uses an older version of the protocol file format, or &quot;schema&quot;.
          </p>
          <p>
            Newer schema versions support additional features in Network Canvas. During the beta
            phase, we kindly request that you update your protocols to the latest version, and
            evaluate the newest features as we implement them. To do this, open the original
            protocol file it in the latest version of Architect, and follow the migration
            instructions. Once migrated, install the new version of the protocol on this device.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
          <p>
            In the meantime, you can continue to use this protocol to start interviews or
            export data.
          </p>
        </React.Fragment>
      ),
    });
  };

  const handleSchemaObsoleteInfo = () => {
    openDialog({
      type: 'Error',
      title: 'Obsolete Protocol Schema',
      canCancel: false,
      message: (
        <React.Fragment>
          <p>
            This protocol uses an obsolete version of the protocol file format, or
            &quot;schema&quot;.
          </p>
          <p>
            The version of the schema used by this protocol is incompatible with this version of
            Network Canvas. You may still export interview data that has already been collected,
            but you may not start additional interviews.
          </p>
          <p>
            If you require the ability to start interviews, you can either (1) install an updated
            version of this protocol that uses the latest schema, or (2) downgrade your version
            of Network Canvas to a version that supports this protocol schema version.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
        </React.Fragment>
      ),
    });
  };

  const modifierClasses = cx(
    'protocol-card',
    { 'protocol-card--info': !isObsoleteProtocol() && isOutdatedProtocol() },
    { 'protocol-card--error': isObsoleteProtocol() },
  );

  const renderCardIcon = () => {
    if (isOutdatedProtocol()) {
      return (
        <div className="status-icon status-icon__info" onClick={(e) => { e.stopPropagation(); handleSchemaOutdatedInfo(); }}>
          <Icon name="info" />
        </div>
      );
    }

    if (isObsoleteProtocol()) {
      return (
        <div className="status-icon status-icon__error" onClick={(e) => { e.stopPropagation(); handleSchemaObsoleteInfo(); }}>
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
          <h6>Installed: {formatDate(lastModified)}</h6>
          <h6>Last Used: {formatDate(lastModified)}</h6>
          <h6>Schema Version: {schemaVersion}</h6>
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

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolCard);

