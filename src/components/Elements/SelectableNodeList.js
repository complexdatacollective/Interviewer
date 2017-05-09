import React, { Component } from 'react';
import Touch from 'react-hammerjs';
import _ from 'lodash';

import { Node } from '../../components/Elements';

class SelectableNodeList extends Component {

  render() {
    const {
      network,
      activeNodeAttributes,
      handleSelectNode,
    } = this.props;

    return (
      <div className='node-list node-list--selectable'>
        { network.nodes.map((node, index) => {
          const isActive = _.isMatch(node, activeNodeAttributes);

          return (
            <Touch key={ index } onTap={ () => handleSelectNode(node) } >
              <Node { ...node } label={ `${node.nickname}` } isActive={ isActive } />
            </Touch>
          );
        }) }
      </div>
    );
  }
}

export default SelectableNodeList;
