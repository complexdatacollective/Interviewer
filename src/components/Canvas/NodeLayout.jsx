import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import LayoutNode from '../../containers/Canvas/LayoutNode';

const NodeLayout = React.forwardRef(({
  nodes,
  allowPositioning,
  highlightAttribute,
  connectFrom,
  allowSelect,
  destinationRestriction,
  onSelected,
  layout,
  twoMode,
  width,
  height,
}, ref) => {
  const layoutVariable = useCallback(
    (nodeType) => {
      if (twoMode) {
        return layout[nodeType];
      }

      return layout;
    },
    [layout, twoMode],
  );

  const isHighlighted = useCallback(
    (node) => !isEmpty(highlightAttribute)
      && get(node, [entityAttributesProperty, highlightAttribute]) === true,
    [highlightAttribute],
  );

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  const isDisabled = useCallback(
    (node) => {
      const originType = get(nodes, [connectFrom, 'type']);
      if (!originType) { return false; }
      const thisType = get(node, 'type');

      if (destinationRestriction === 'same') {
        return thisType !== originType;
      }

      if (destinationRestriction === 'different') {
        return thisType === originType;
      }

      return false;
    },
    [connectFrom, destinationRestriction, nodes],
  );

  return (
    <div className="node-layout" ref={ref}>
      {nodes.map((node) => (
        <LayoutNode
          key={node[entityPrimaryKeyProperty]}
          node={node}
          layoutVariable={layoutVariable(node.type)}
          onSelected={() => onSelected(node)}
          selected={isHighlighted(node)}
          linking={isLinking(node)}
          disabled={isDisabled(node)}
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
  layout: PropTypes.string.isRequired,
  twoMode: PropTypes.bool.isRequired,
  destinationRestriction: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

NodeLayout.defaultProps = {
  connectFrom: null,
  highlightAttribute: null,
  allowSelect: true,
  destinationRestriction: null,
};

export { NodeLayout };

export default NodeLayout;
