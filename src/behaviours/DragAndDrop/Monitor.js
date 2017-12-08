import React, { PureComponent } from 'react';
import { compose } from 'redux';
import { pick, isEqual } from 'lodash';
import store from './store';

const monitor = (getMonitorProps, types) =>
  WrappedComponent =>
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
        const monitorProps = pick(getMonitorProps(store.getState(), this.props), types);
        if (!isEqual(this.state.monitorProps, monitorProps)) {
          this.setState({ monitorProps });
        }
      }

      render() {
        const props = {
          ...this.props,
          ...this.state.monitorProps,
        };

        return <WrappedComponent {...props} />;
      }
    };

export default monitor;
