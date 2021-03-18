import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';

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
      { nodes.map((node) => (
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
      ))}
    </div>
  );
});

NodeLayout.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSelected: PropTypes.func.isRequired,
  connectFrom: PropTypes.string,
  highlightAttribute: PropTypes.string,
  allowPositioning: PropTypes.bool.isRequired,
  allowSelect: PropTypes.bool,
  layoutVariable: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

NodeLayout.defaultProps = {
  connectFrom: null,
  highlightAttribute: null,
  allowSelect: true,
};

export { NodeLayout };

export default NodeLayout;
