import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Edge from '../Edge';

const viewBoxScale = 100;

export class EdgeLayout extends PureComponent {
  static propTypes = {
    edges: PropTypes.array,
  };

  static defaultProps = {
    edges: [],
  };

  renderEdge = (edge) => {
    if (!['key', 'from', 'to', 'type'].every((prop) => prop in edge)) {
      return null;
    }

    const {
      key, from, to, type,
    } = edge;

    return (
      <Edge key={key} from={from} to={to} type={type} viewBoxScale={viewBoxScale} />
    );
  };

  render() {
    const { edges } = this.props;

    return (
      <div className="edge-layout">
        <svg viewBox={`0 0 ${viewBoxScale} ${viewBoxScale}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          { edges.map(this.renderEdge) }
        </svg>
      </div>
    );
  }
}

export default EdgeLayout;
