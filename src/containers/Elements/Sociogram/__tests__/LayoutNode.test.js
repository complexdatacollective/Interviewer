/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { LayoutNode } from '../LayoutNode';

const layout = 'foo';

const mockProps = {
  onDropped: () => {},
  updateNode: () => {},
  onSelected: () => {},
  layoutVariable: layout,
  node: { [layout]: { x: 0.77, y: 0.2 } },
  areaWidth: 100,
  areaHeight: 40,
  draggableType: 'bar',
};

describe('<LayoutNode />', () => {
  it('renders ok', () => {
    const component = shallow(<LayoutNode {...mockProps} />);

    expect(component).toMatchSnapshot();
  });

  it('positions using translate/top/left', () => {
    const component = shallow(<LayoutNode {...mockProps} />);

    expect(component.prop('style')).toEqual(
      {
        left: '77%',
        top: '20%',
        transform: 'translate(-50%, -50%)',
      },
    );
  });
});
