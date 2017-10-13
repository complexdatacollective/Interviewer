/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { map, orderBy } from 'lodash';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable } from '../../behaviours';
import { DropZone } from '../../components/Elements';

export class OrdinalBins extends Component {

  constructor(props) {
    super(props);
  }
  
  render() {
    const binValues = orderBy(
      map(props.prompt.bins.values,
        (value, title) => [title, value]
      ),
      (titleValuePair) => titleValuePair[1],
      'desc',
    );
    const bins = binValues.map(
      (binValue, index) => <Bin title={binValue[0]} count={binValues.length} index={index} key={index} value={binValue[1]} />
    );
    const Bin = ({ title, index, value, count, nodes, layout, position, select }) => {
      const keyWithValue = value > 0 ? index + 1 : 0;
      const draggableType = 'POSITIONED_NODE';
      return (
        <div className={'ordinal-bin__bin ordinal-bin__bin--' + count + '-' + keyWithValue}>
          <div className={'ordinal-bin__bin--title ordinal-bin__bin--title--' + count + '-' + keyWithValue}>{title}</div>
          <DropZone droppableName={'ORDINAL_BIN-' + value} acceptsDraggableType={draggableType}>
            <div className={'ordinal-bin__bin--content ordinal-bin__bin--content--' + count + '-' + keyWithValue}>
            { nodes.map((node, key) => {
              if (!Object.prototype.hasOwnProperty.call(node, layout)) { return null; }

              const { x, y } = node[layout];

              const styles = {
                left: asPercentage(x),
                top: asPercentage(y),
              };

              return (
                <div
                  key={key}
                  className="ordinal-bin__node"
                  style={styles}
                >
                  <EnhancedNode
                    label={label(node)}
                    draggableType={draggableType}
                    onDropped={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                    onMove={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                    onSelected={() => this.onSelectNode(node)}
                    selected={this.isSelected(node)}
                    canDrag={canPosition(position)}
                    canSelect={canSelect(select)}
                    animate={false}
                    {...node}
                  />
                </div>
              );
            }) }
            </div>
          </DropZone>
        </div>
      )
    }

    return (
      <StaggeredTransitionGroup
        className="ordinal-bin"
        component="div"
        delay={animation.duration.fast * 0.2}
        duration={animation.duration.slow}
        start={animation.duration.slow + 3}
        transitionName="ordinal-bin--transition"
        transitionLeave={false}
      >
        {bins}
      </StaggeredTransitionGroup>
    );
  }
}

OrdinalBins.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
  const bins = props.prompt.bins;

  return {
    nodes: getPlacedNodes(state, props),
    layout: bins.layout,
    select: bins.select,
    position: bins.position,
    attributes: bins.nodeAttributes,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(networkActions.toggleEdge, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withBounds,
)(OrdinalBins);