import React from 'react';
import { renderToString } from 'react-dom/server';
import UINode from '@codaco/ui/lib/components/Node';

const LayoutNode = ({ handleClick, layout, ...props }) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.transform = 'translate(-50%, -50%)';
  container.onClick = handleClick;
  container.innerHTML = renderToString(<UINode {...props} />);

  return { el: container, layout: { ...layout } };
};

export default LayoutNode;
