import { first, has } from 'lodash';
import { networkNodes } from './interface';
import { createDeepEqualSelector } from './utils';
import sortOrder from '../utils/sortOrder';
import { getNodeAttributes } from '../ducks/modules/network';

const getLayout = (_, props) => props.layout;
const getSubject = (_, props) => props.subject;
const getSortOptions = (_, props) => props.sortOrder;

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder } props
 */
export const makeGetNextUnplacedNode = () =>
  createDeepEqualSelector(
    networkNodes,
    getSubject,
    getLayout,
    getSortOptions,
    (nodes, { type }, layout, sortOptions) => {
      const unplacedNodes = nodes.filter((node) => {
        const attributes = getNodeAttributes(node);

        return (
          node.type === type &&
          !has(attributes, layout)
        );
      });

      const sorter = sortOrder(sortOptions);

      return first(sorter(unplacedNodes));
    },
  );
