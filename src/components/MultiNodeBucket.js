import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Node from '../containers/Node';
import { Node as NodeTransition } from './Transition';
import { NO_SCROLL } from '../behaviours/DragAndDrop/DragManager';
import { DragSource } from '../behaviours/DragAndDrop';
import createSorter from '../utils/createSorter';

const EnhancedNode = DragSource(Node);

const MultiNodeBucket = (props) => {
  const {
    nodes,
    listId,
    sortOrder,
    nodeColor,
    label,
    itemType,
  } = props;

  const [stagger, setStagger] = useState(true);
  const [exit, setExit] = useState(true);
  const [currentListId, setCurrentListId] = useState(null);
  const [sortedNodes, setSortedNodes] = useState([]);

  useEffect(() => {
    const sorter = createSorter(sortOrder);
    const sorted = sorter(nodes);

    // On first run, just set the nodes.
    if (!currentListId) {
      setSortedNodes(sorted);
      setCurrentListId(listId);
      return;
    }

    // if we provided the same list id, update immediately without exit or
    // stagger animations.
    if (listId === currentListId) {
      setExit(false);
      setStagger(false);
      setSortedNodes(sorted);
      return;
    }

    // Otherwise, enable animations and update after a delay.
    setExit(true);
    setStagger(true);
    setSortedNodes([]);

    const refreshTimer = setTimeout(() => {
      setSortedNodes(sorted);
      setCurrentListId(listId);
    }, getCSSVariableAsNumber('--animation-duration-slow-ms'));

    // eslint-disable-next-line consistent-return
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [nodes, sortOrder, listId]);

  return (
    <TransitionGroup
      className="node-list"
      exit={exit}
    >
      {
        sortedNodes.slice(0, 3).map((node, index) => (
          <NodeTransition
            key={`${node[entityPrimaryKeyProperty]}_${index}`}
            index={index}
            stagger={stagger}
          >
            <EnhancedNode
              color={nodeColor}
              inactive={index !== 0}
              allowDrag={index === 0}
              label={`${label(node)}`}
              meta={() => ({ ...node, itemType })}
              scrollDirection={NO_SCROLL}
              {...node}
            />
          </NodeTransition>
        ))
      }
    </TransitionGroup>
  );
};

// /**
//   * Renders a list of Node.
//   */
// class MultiNodeBucket extends Component {
//   constructor(props) {
//     super(props);

//     const sorter = createSorter(props.sortOrder);
//     const sortedNodes = sorter(props.nodes);

//     this.state = {
//       nodes: sortedNodes,
//       stagger: true,
//       exit: true,
//     };

//     this.refreshTimer = null;
//   }

//   // eslint-disable-next-line camelcase
//   UNSAFE_componentWillReceiveProps(newProps) {
//     const {
//       nodes,
//       listId,
//     } = this.props;
//     // Don't update if nodes are the same
//     if (isEqual(newProps.nodes, nodes) && isEqual(newProps.sortOrder, this.props.sortOrder)) {
//       console.log('not updating!');
//       return;
//     }

//     console.log('updating');

//     const sorter = createSorter(newProps.sortOrder);
//     const sortedNodes = sorter(newProps.nodes);

//     // if we provided the same id, then just update normally
//     if (newProps.listId === listId) {
//       this.setState({ exit: false }, () => {
//         this.setState({ nodes: sortedNodes, stagger: false });
//       });
//       return;
//     }

//     // Otherwise, transition out and in again
//     this.setState({ exit: true }, () => {
//       this.setState(
//         { nodes: [], stagger: true },
//         () => {
//           if (this.refreshTimer) { clearTimeout(this.refreshTimer); }
//           this.refreshTimer = setTimeout(
//             () => this.setState({
//               nodes: sortedNodes,
//               stagger: true,
//             }),
//             getCSSVariableAsNumber('--animation-duration-slow-ms'),
//           );
//         },
//       );
//     });
//   }

//   render() {
//     const {
//       nodeColor,
//       label,
//       itemType,
//     } = this.props;

//     const {
//       stagger,
//       nodes,
//       exit,
//     } = this.state;

//     return (
//       <TransitionGroup
//         className="node-list"
//         exit={exit}
//       >
//         {
//           nodes.slice(0, 3).map((node, index) => (
//             <NodeTransition
//               key={`${node[entityPrimaryKeyProperty]}_${index}`}
//               index={index}
//               stagger={stagger}
//             >
//               <EnhancedNode
//                 color={nodeColor}
//                 inactive={index !== 0}
//                 allowDrag={index === 0}
//                 label={`${label(node)}`}
//                 meta={() => ({ ...node, itemType })}
//                 scrollDirection={NO_SCROLL}
//                 {...node}
//               />
//             </NodeTransition>
//           ))
//         }
//       </TransitionGroup>
//     );
//   }
// }

MultiNodeBucket.propTypes = {
  nodes: PropTypes.array,
  nodeColor: PropTypes.string,
  itemType: PropTypes.string,
  label: PropTypes.func,
  listId: PropTypes.string.isRequired,
  sortOrder: PropTypes.array,
};

MultiNodeBucket.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  itemType: 'NODE',
  sortOrder: [],
};

export default MultiNodeBucket;
