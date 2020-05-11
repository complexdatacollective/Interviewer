import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import { Scroller } from '.';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../config';

const formatDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const ServerProtocolCard = (props) => {
  const {
    protocolid,
    onClickHandler,
    openDialog,
    schemaVersion,
    lastModified,
    whenInstalled,
    name,
    description,
  } = props;

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
    'protocol-card--server',
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
    <div className={modifierClasses} onClick={() => onClickHandler(protocolid)}>
      <div className="protocol-card__icon-section">
        <div className="protocol-icon">
          <Icon name="protocol-card" />
        </div>
        {renderCardIcon()}
        <div className="protocol-meta">
          <h6>Installed: {formatDate(whenInstalled)}</h6>
          <h6>Last Modified: {formatDate(lastModified)}</h6>
          <h6>Schema Version: {schemaVersion}</h6>
        </div>
      </div>
      <div className="protocol-card__main-section">
        <h2 className="protocol-name">{name}</h2>
        <Scroller className="protocol-description">
          { description || (<em>No protocol description.</em>) }
        </Scroller>
      </div>
    </div>
  );
};

ServerProtocolCard.defaultProps = {
  className: '',
  onClickHandler: () => {},
  description: null,
};

ServerProtocolCard.propTypes = {
  onClickHandler: PropTypes.func,
  openDialog: PropTypes.func.isRequired,
  schemaVersion: PropTypes.number.isRequired,
  lastModified: PropTypes.string.isRequired,
  whenInstalled: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  id: PropTypes.string.isRequired,

};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
  };
}

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocolCard);

