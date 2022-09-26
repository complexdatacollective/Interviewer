import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { entityAttributesProperty } from '@codaco/shared-consts';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { findIndex } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { ConvexHull } from './ConvexHull';
import { getCategoricalOptions } from '../../selectors/network';

const getColor = (group, options) => {
  const colorIndex = findIndex(options, ['value', group]) + 1 || 1;
  const color = `cat-color-seq-${colorIndex}`;
  return color;
};

const ConvexHulls = (props) => {
  const {
    groupVariable,
    layoutVariable,
    nodes,
  } = props;

  const categoricalOptions = useSelector(
    (state) => getCategoricalOptions(state, { variableId: groupVariable, ...props }),
  );

  const nodesByGroup = useMemo(() => {
    const groupedList = {};

    nodes.forEach((node) => {
      const categoricalValues = node[entityAttributesProperty][groupVariable];

      // Filter out nodes with no value for this variable.
      if (!categoricalValues) { return; }

      categoricalValues.forEach((categoricalValue) => {
        if (groupedList[categoricalValue]) {
          groupedList[categoricalValue].nodes.push(node);
        } else {
          groupedList[categoricalValue] = { group: categoricalValue, nodes: [] };
          groupedList[categoricalValue].nodes.push(node);
        }
      });
    });

    return groupedList;
  }, [nodes, groupVariable, categoricalOptions]);

  const hullComponent = useRef(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const updateSize = useCallback(() => {
    if (hullComponent.current && (
      size.width !== getAbsoluteBoundingRect(hullComponent.current).width
      || size.height !== getAbsoluteBoundingRect(hullComponent.current).height)
    ) {
      setSize({
        width: getAbsoluteBoundingRect(hullComponent.current).width,
        height: getAbsoluteBoundingRect(hullComponent.current).height,
      });
    }
  }, [size, hullComponent]);

  useEffect(() => {
    updateSize();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={hullComponent}>
      {Object.values(nodesByGroup).map(({ group, nodes: groupNodes }, index) => {
        const color = getColor(group, categoricalOptions);
        return (
          <ConvexHull
            windowDimensions={size}
            color={color}
            nodePoints={groupNodes}
            key={index}
            layoutVariable={layoutVariable}
          />
        );
      })}
    </div>
  );
};

ConvexHulls.propTypes = {
  layoutVariable: PropTypes.string.isRequired,
};

export default ConvexHulls;
