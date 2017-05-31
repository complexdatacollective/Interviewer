/* eslint-disable */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import validations from '../../utils/validations';
import components from '../../utils/fieldComponents';

const withNetworkData = (WrappedComponent, selector) => {
  class WithNetworkData extends Component {
    render() {
      return <WrappedComponent options={this.state.options} {...this.props} />;
    }
  }

  function mapStateToProps(state) {
    return {
      options: selector(state),
    };
  }

  return connect(mapStateToProps)(WithNetworkData)
};


const getComponent = type => (
  Object.hasOwnProperty.call(components, type) ? components[type] : () => (<div>Field type not defined</div>)
);

const getValidation = validation =>
  map(
    toPairs(validation),
    ([type, options]) => (
      Object.hasOwnProperty.call(validations, type) ? validations[type](options) : () => (`Validation "${type}" not found`)
    ),
  );

/**
  * Renders a redux form field in the style of our app.
  */
const Field = ({ label, name, type, validation, selector, ...rest }) => {
  const validate = getValidation(validation);
  let component = getComponent(type);
  if (selector) { component = withNetworkData(component, selector); }
  return <ReduxFormField {...rest} name={name} label={label} component={component} validate={validate}/>;
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  validation: PropTypes.object,
};

Field.defaultProps = {
  validation: {},
};

export default Field;
