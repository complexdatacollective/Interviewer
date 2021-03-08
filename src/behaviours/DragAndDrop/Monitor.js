/* eslint-disable implicit-arrow-linebreak, react/jsx-props-no-spreading */
import React, { PureComponent } from 'react';
import { pick, isEqual } from 'lodash';
import store from './store';

const monitor = (getMonitorProps, types) => (WrappedComponent) =>
  class Monitor extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { monitorProps: null };
    }

    componentDidMount() {
      this.unsubscribe = store.subscribe(this.updateMonitorProps);
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    updateMonitorProps = () => {
      const monitorPropsNew = pick(getMonitorProps(store.getState(), this.props), types);
      const { monitorProps } = this.state;
      if (!isEqual(monitorProps, monitorPropsNew)) {
        this.setState({ monitorProps: monitorPropsNew });
      }
    }

    render() {
      const { monitorProps } = this.state;

      const props = {
        ...this.props,
        ...monitorProps,
      };

      return <WrappedComponent {...props} />;
    }
  };

export default monitor;
