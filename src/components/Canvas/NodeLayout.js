import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  isEmpty, has, isNil, get,
} from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import { entityPrimaryKeyProperty, getEntityAttributes, entityAttributesProperty } from '../../ducks/modules/network';

const NodeLayout = React.forwardRef(({
  nodes,
  allowPositioning,
  highlightAttribute,
  connectFrom,
  allowSelect,
  onSelected,
  layoutVariable,
  width,
  height,
}, ref) => {
  const isHighlighted = useCallback(
    (node) => !isEmpty(highlightAttribute)
        && get(node, [entityAttributesProperty, highlightAttribute]) === true,
    [highlightAttribute],
  );

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  return (
    <div className="node-layout" ref={ref}>
      { nodes.map((node) => {
        const nodeAttributes = getEntityAttributes(node);
        if (!has(nodeAttributes, layoutVariable) || isNil(nodeAttributes[layoutVariable])) {
          return null;
        }

        return (
          <LayoutNode
            key={node[entityPrimaryKeyProperty]}
            node={node}
            layoutVariable={layoutVariable}
            onSelected={() => onSelected(node)}
            selected={isHighlighted(node)}
            linking={isLinking(node)}
            allowPositioning={allowPositioning}
            allowSelect={allowSelect}
            areaWidth={width}
            areaHeight={height}
          />
        );
      }) }
    </div>
  );
});

NodeLayout.propTypes = {
  nodes: PropTypes.array,
  onSelected: PropTypes.func.isRequired,
  connectFrom: PropTypes.string,
  highlightAttribute: PropTypes.string,
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
  layoutVariable: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

NodeLayout.defaultProps = {
  connectFrom: null,
  nodes: [],
  highlightAttribute: null,
  allowPositioning: true,
  allowSelect: true,
  layoutVariable: null,
  width: null,
  height: null,
};

export { NodeLayout };

export default NodeLayout;
