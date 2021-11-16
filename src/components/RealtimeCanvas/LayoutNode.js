import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
// import UINode from '@codaco/ui/lib/components/Node';
import UINode from '../../containers/Node';

const LayoutNode = ({ portal, ...props }) => {
  // // container.onClick = handleClick;
  // container.innerHTML = renderToString(<UINode {...props} store={() => ({})} />);

  // return container; //{ el: container, layout: { ...layout } };
  return ReactDOM.createPortal(
    <UINode {...props} />,
    portal,
  );
};

export default LayoutNode;
