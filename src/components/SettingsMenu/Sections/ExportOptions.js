import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { motion } from 'framer-motion';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { actionCreators as deviceSettingsActions } from '../../../ducks/modules/deviceSettings';
import TabItemVariants from './TabItemVariants';

const ExportOptions = (props) => {
  const {
    exportOptions: {
      exportGraphML = true,
      exportCSV = false,
      globalOptions: {
        unifyNetworks = false,
        useScreenLayoutCoordinates = true,
        screenLayoutHeight = 1920,
        screenLayoutWidth = 1080,
      },
    },
  } = props;

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            value: exportGraphML,
            onChange: (value) => {
              console.log('change', value);
            },
          }}
        />
        <div>
          <h2>Export GraphML</h2>
          <p>
            GraphML is the main file format used by Network Canvas. GraphML files can be used
            to manually import your data into Server, and can be opened by many other pieces
            of network analysis software.
          </p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            value: exportCSV,
            onChange: (value) => {
              console.log('change', value);
            },
          }}
        />
        <div>
          <h2>Export CSV</h2>
          <p>
            CSV is a widely used format for storing network data, but this wider compatibility
            comes at the expense of robustness. If you enable this format, your networks will
            be exported as an <strong>attribute list file</strong> for each node type,
            an <strong>edge list file</strong> for each edge type, and an <strong>ego attribute
            file</strong> that also contains session data.
          </p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            value: unifyNetworks,
            onChange: (value) => {
              console.log('change', value);
            },
          }}
        />
        <div>
          <h2>Unify Networks</h2>
          <p>
          If you enable this option, exporting multiple sessions at the same time will cause
          them to be merged into a single file. In the case of CSV export, you will receive
          one of each type of file, with all entities across all the sessions you have
          exported. In the case of GraphML you will receive a single GraphML file with
          multiple <code>graph</code> elements. Please note that most software does not yet
          support multiple graphs in a single GraphML file.
          </p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            value: useScreenLayoutCoordinates,
            onChange: (value) => {
              console.log('change', value);
            },
          }}
        />
        <div>
          <h2>Use Screen Layout Coordinates</h2>
          <p>
          By default Network Canvas exports sociogram node coordinates as normalized X/Y
          values (a number between 0 and 1 for each axis, with the origin in the top
          left). If you prefer, you can enable this option to instead store coordinates as
          screen space pixel values. Please note that this function assumes that the
          sociogram was created while the app was running in full screen mode.
          </p>
        </div>
      </motion.article>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  updateSetting: (setting, value) => dispatch(deviceSettingsActions.setSetting(setting, value)),
});

const mapStateToProps = state => ({
  exportOptions: state.deviceSettings.exportOptions,
});

ExportOptions.propTypes = {
  exportOptions: PropTypes.object,
  // updateSetting: PropTypes.func.isRequired,
};

ExportOptions.defaultProps = {
  exportOptions: {
    globalOptions: {},
  },
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(ExportOptions);

