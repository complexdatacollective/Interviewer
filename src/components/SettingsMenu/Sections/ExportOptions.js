import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { motion } from 'framer-motion';
import { RadioGroup } from '@codaco/ui/lib/components/Fields';
import { actionCreators as deviceSettingsActions } from '../../../ducks/modules/deviceSettings';
import TabItemVariants from './TabItemVariants';

const ExportOptions = (props) => {
  const {
    updateSetting,
    exportFormat,
  } = props;

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element--wide">
        <div>
          <h2>File Type</h2>
          <p>
            Choose an export format. If multiple files are produced, they’ll be archived in a ZIP
            for download.
          </p>
        </div>
        <RadioGroup
          options={[
            {
              label: 'GraphML',
              value: 'graphml',
            },
            {
              label: 'CSV',
              value: 'csv',
            },
          ]}
          input={{
            name: 'export_format',
            value: exportFormat,
            onChange: selected => updateSetting('exportFormat', selected),
          }}
        />
      </motion.article>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  updateSetting: (setting, value) => dispatch(deviceSettingsActions.setSetting(setting, value)),
});

const mapStateToProps = state => ({
  exportFormat: state.deviceSettings.exportFormat,
});

ExportOptions.propTypes = {
  exportFormat: PropTypes.string.isRequired,
  updateSetting: PropTypes.func.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(ExportOptions);

