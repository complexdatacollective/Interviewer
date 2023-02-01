import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';

class StageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      return (
        <div className="error-boundary">
          <p><Icon name="error" /></p>
          <h1>There was a problem with this stage.</h1>
          <p>
            The following error occurred:
            <code>{error.message}</code>
          </p>
        </div>
      );
    }
    return children;
  }
}

StageErrorBoundary.defaultProps = {
  children: null,
};

StageErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
};

export default StageErrorBoundary;
