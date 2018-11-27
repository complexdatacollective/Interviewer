import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Edge } from '../Edge';

const viewBoxScale = 100;

export class EdgeLayout extends PureComponent {
  static propTypes = {
    displayEdges: PropTypes.array,
  };

  static defaultProps = {
    displayEdges: [],
  };

  renderEdge = ({ key, from, to, type }) => (
    <Edge key={key} from={from} to={to} type={type} viewBoxScale={viewBoxScale} />
  );

  render() {
    const { displayEdges } = this.props;

    return (
      <div className="edge-layout">
        <svg viewBox={`0 0 ${viewBoxScale} ${viewBoxScale}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          { displayEdges.map(this.renderEdge) }
        </svg>
      </div>
    );
  }
}

export default EdgeLayout;
