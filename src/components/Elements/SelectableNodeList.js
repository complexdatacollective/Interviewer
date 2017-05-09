import React, { Component } from 'react';
import _ from 'lodash';

import selectable from '../../behaviors/selectable';
import draggable from '../../behaviors/draggable';
import { Node } from '../../components/Elements';

const SelectableNode = draggable(selectable(Node));

class SelectableNodeList extends Component {

  render() {
    const {
      network,
      activeNodeAttributes,
      handleSelectNode,
    } = this.props;

    function handleDropNode(hits, node) {
      console.log(hits, node, 'yo');
    }

    return (
      <div className='node-list node-list--selectable'>
        { network.nodes.map((node, index) => {
          const isActive = _.isMatch(node, activeNodeAttributes);

          return (
            <SelectableNode key={ index } onDropped={ (hits) => handleDropNode(hits, node) }  onSelect={ () => handleSelectNode(node) } label={ `${node.nickname}` } isActive={ isActive } { ...node } />
          );
        }) }
      </div>
    );
  }
}

export default SelectableNodeList;
